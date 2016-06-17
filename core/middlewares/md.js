'use strict';

var path = require('path');
var prettyHrtime = require('pretty-hrtime');
var processMd = require(path.join(global.pathToApp,'core/lib/processMd'));

/*
 * Get file content from response and parse contained Markdown markup
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function (req, res, next) {
    if (req.specData && req.specData.renderedHtml && req.specData.isMd) {
        var start = process.hrtime();
        var plainMarkdown = req.specData.renderedHtml;

        req.specData.renderedHtml = processMd(plainMarkdown, {
            wrapDescription: true
        });

        var end = process.hrtime(start);
        global.log.debug('Markdown processing took: ', prettyHrtime(end));

        req.specData.isMd = false;

        next();
    } else {
        next();
    }
};
