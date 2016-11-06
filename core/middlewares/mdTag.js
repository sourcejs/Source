'use strict';

var path = require('path');
var processMd = require(path.join(global.pathToApp,'core/lib/processMd'));

/*
 * Get html from response and parse contained Markdown markup
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function (req, res, next) {
    if (req.specData && req.specData.renderedHtml) {
        var html = req.specData.renderedHtml;

        /* find text wrapped with <markdown> */
        html = html.replace(/<markdown>([\s\S]*?)<\/markdown>/g, function(match) {
            // strip tags
            match = match.replace(/<markdown>|<\/markdown>/g, '');

            // Remove tabs and multiple spaces
            match = match.replace(/\t/g, '').replace(/ +(?= )/g, '');

            // render markdown
            return processMd(match);
        });

        req.specData.renderedHtml = html;
    }

    next();
};
