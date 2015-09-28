'use strict';

var cheerio = require('cheerio');
var ParseData = new (require('./parseData'))();

/**
 * Parse Spec page contents into HTML tree
 *
 * @param {String} specHTML - Full Spec page html (from request)
 *
 * @returns {Object} Return parsed Spec page object
 */
module.exports.process = function (specHTML) {
    var output = {
        headResources: {},
        bodyResources: {},
        contents: []
    };

    var $ = cheerio.load(specHTML, {decodeEntities: false});

    var parseBlock = function (elements, blockID, blockDefaultID, nesting) {
        nesting = nesting || 0;

        var headers = ['h2','h3', 'h4'];
        var currentHeaderLevel = headers[nesting] || '';
        var nextLevelheading = headers[(nesting + 1)] || '';
        var untilHook = headers.slice(0, nesting + 2);

        var block = {
            nested: [],
            html: []
        };
        var nextHeadersArr = elements.filter(nextLevelheading);
        var $currentScope = elements.first().nextUntil(untilHook.join(', '));
        $currentScope = elements.first().add($currentScope);

        block.id = blockID;
        block.visualID = blockDefaultID;

        block.header = $currentScope.filter(currentHeaderLevel).first().text();

        $currentScope.filter('.source_example').each(function () {
            block.html.push($(this).html());
        });

        if (nextHeadersArr.length > 0) {
            nesting++;

            nextHeadersArr.each(function(subIndex){
                var $nextScope = $(this).nextUntil(nextLevelheading);
                $nextScope = $(this).first().add($nextScope);

                var nextBlockDefaultID = blockDefaultID + '.' +  (subIndex + 1);
                var nextBlockID = $nextScope.filter(nextLevelheading).first().attr('id') || nextBlockDefaultID;

                block.nested.push(parseBlock($nextScope, nextBlockID, nextBlockDefaultID, nesting));
            });
        }

        return block;
    };

    $('.source_section').each(function (index) {
        var $this = $(this);
        var nextIndexString = (index + 1).toString();
        var blockID = $this.attr('id') || nextIndexString;
        var blockDefaultID = nextIndexString;

        output.contents.push(parseBlock($this.children(), blockID, blockDefaultID));
    });

    return output;
};

/**
 * Get specific sections from parsed Spec page object
 *
 * @param {Object} specObject - Parsed Spec page object
 * @param {Array} sections - Array of sections to return
 *
 * @returns {Object} Return object with specified sections HTML OR undefined
 */
module.exports.getBySection = function (specObject, sections) {
    return ParseData.traverseSections(specObject, sections);
};