'use strict';

var marked = require('marked');
var jsdom = require('jsdom');
var path = require('path');
var fs = require('fs');
var pathToApp = path.dirname(require.main.filename);
var jquery = fs.readFileSync(path.join(pathToApp,'assets/js/lib/jquery-1.11.1.js'), "utf-8");

/*
 * Get file content from response and parse contained Markdown markup
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function (req, res, next) {
    if (req.specData && req.specData.renderedHtml && req.specData.isMd) {
        var input = req.specData.renderedHtml;

        jsdom.env({
            html: '<html><body id="data">'+marked(input)+'</body></html>',
            src: [jquery],
            done: function (errors, window) {
                var $ = window.$;

                //console.log('data', $('#data').html());

                $('h1').nextUntil('h2').wrapAll('<div class="source_info" />');

                $('h2').each(function(){
                    var $el = $(this);
                    var $nextElems = $(this).nextUntil('h2');
                    var $allElems = $.merge($el, $nextElems);

                    $allElems.wrapAll('<section class="source_section" />');
                });

                //console.log('data2', $('#data').html());

                req.specData.renderedHtml = $('#data').html();

                next();
            }
        });
    } else {
        next();
    }
};