'use strict';

var cheerio = require('cheerio');
var ParseData = new (require('./parseData'))();

/**
 * Filter list of HTML nodes
 *
 * @param {Object} $ - cheerio root object
 * @param {Array} $elements - nodelist to filter
 * @param {Function} [customElFilter] - Additional filter for element
 * @param {Boolean} [skipAttrFilters] - Set to true, if expect not filtered list of resources
 *
 * @returns {Array} Returns array with HTML of Style containers OR undefined
 */
var filterResourceElements = function($, $elements, customElFilter, skipAttrFilters){
    var filteredArr = [];
    var defaultFilter = function () {
        return true;
    };
    var _customElFilter = typeof customElFilter === 'function' ? customElFilter : defaultFilter;

    // Checking some exceptions
    var checkDataSet = function($el){
        var elementAttrs = $el.attributes || $el.attribs;

        if (skipAttrFilters) {
            return true;
        } else {
            return !(
                elementAttrs['data-nonclarify'] ||
                elementAttrs['data-requiremodule'] ||
                elementAttrs['data-source'] === 'core' ||
                elementAttrs['data-source'] === 'plugin'
            );
        }
    };

    if ($elements && $elements.length > 0) {
        $elements.each(function(){
           var el = this;

            if (_customElFilter(el) && checkDataSet(el)) {
                // If not need to filter out, then push to output
                filteredArr.push($.html($(el)));
            }
        });

        return filteredArr.length > 0 ? filteredArr : undefined;
    } else {
        return undefined;
    }
};

/**
 * Parse CSS links from Spec
 *
 * @param {Object} $ - cheerio root object
 * @param {Object} scope to search - body or head, defaults to root
 * @param {Boolean} [skipAttrFilters] - Set to true, if expect not filtered list of resources
 *
 * @returns {Array} Returns array with HTML of CSS links OR undefined
 */
var getCssLinksHTML = module.exports.getCssLinksHTML = function($, scope, skipAttrFilters) {
    var $scope = scope ? $(scope) : $.root();
    var $links = $scope.find('link');

    var customFilter = function(el){
        var elementAttrs = el.attributes || el.attribs;

        return elementAttrs.rel === 'stylesheet';
    };

    return filterResourceElements($, $links, customFilter, skipAttrFilters);
};


/**
 * Parse Scripts from Spec
 *
 * @param {Object} $ - cheerio root object
 * @param {Object} scope to search - body or head, defaults to root
 * @param {Boolean} [skipAttrFilters] - Set to true, if expect not filtered list of resources
 *
 * @returns {Array} Returns array with HTML of Scripts OR undefined
 */
var getScriptsHTML = module.exports.getScriptsHTML = function($, scope, skipAttrFilters) {
    var $scope = scope ? $(scope) : $.root();
    var $scripts = $scope.find('script');

    return filterResourceElements($, $scripts, null, skipAttrFilters);
};

/**
 * Parse Style containers from Spec
 *
 * @param {Object} $ - cheerio root object
 * @param {Object} scope to search - body or head, defaults to root
 * @param {Boolean} [skipAttrFilters] - Set to true, if expect not filtered list of resources
 *
 * @returns {Array} Returns array with HTML of Style containers OR undefined
 */
var getStyleContainersHTML = module.exports.getStyleContainersHTML = function($, scope, skipAttrFilters){
    var $scope = scope ? $(scope) : $.root();
    var $styles = $scope.find('style');

    return filterResourceElements($, $styles, null, skipAttrFilters);
};


/**
 * Getter for assets resources of the Spec
 *
 * @param {Object} $ - cheerio root object
 * @param {String} $scope - cheerio DOM object
 *
 * @returns {Object} Returns object with HTML lists containing Spec assets resources OR undefined
 */
var getSpecResources = module.exports.getSpecResources = function ($, scope) {
    var output = {};

    output.cssLinks = getCssLinksHTML($, scope) || [];
    output.scripts = getScriptsHTML($, scope) || [];
    output.cssStyles = getStyleContainersHTML($, scope) || [];

    return (output.cssLinks || output.scripts || output.cssStyles) ? output : undefined;
};

/**
 * Parse Spec page contents into HTML tree
 *
 * @param {String} specHTML - Full Spec page html, including head section (from request)
 *
 * @returns {Object} Return parsed Spec page object
 */
module.exports.process = function (specHTML) {
    var $ = cheerio.load(specHTML, {decodeEntities: false});
    var output = {
        headResources: getSpecResources($, 'head'),
        bodyResources: getSpecResources($, 'body'),
        contents: []
    };

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
