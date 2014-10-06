'use strict';

var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var pathToApp = path.dirname(require.main.filename);
var getHeaderAndFooter = require(pathToApp + '/core/headerFooter.js').getHeaderAndFooter;
var userTemplatesDir = global.app.get('user') + "/core/views/";
var coreTemplatesDir = pathToApp + "/core/views/";

/**
 * Get full path to template: default or user-defined if it exists.
 *
 *
 * @param {string} name - Template name
 * @returns {string}
 * */
function getTemplateFullPath (name) {
    var pathToTemplate;

    if (fs.existsSync(userTemplatesDir + name)) {
        pathToTemplate = userTemplatesDir + name;
    } else {
        pathToTemplate = coreTemplatesDir + name;
    }

    return pathToTemplate;
}

/**
 * Wrap rendered html from request with spec wrapper (header, footer, etc.)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function (req, res, next) {

    if (req.specData && req.specData.renderedHtml) {
        // get spec content
        var data = req.specData.renderedHtml.replace(/^\s+|\s+$/g, '');

        // get spec info
        var info = req.specData.info;

        // get header and footer
        var headerFooterHTML = getHeaderAndFooter();

        // choose the proper template, depending on page type
        var template, templatePath;
        if (info.template) {
            templatePath = getTemplateFullPath(info.template + ".ejs");
        } else if (info.role === 'navigation') {
            templatePath = getTemplateFullPath("navigation.ejs");
        } else {
            templatePath = getTemplateFullPath("spec.ejs");
        }
        template = fs.readFileSync(templatePath, "utf-8");

        // if the following fields are not set, set them to defaults
        info.title = info.title ? info.title : "New spec";
        info.author = info.author ? info.author : "Anonymous";
        info.keywords = info.keywords ? info.keywords : "";

        // final data object for the template
        var templateJSON = {
            content : data,
            header  : headerFooterHTML.header,
            footer  : headerFooterHTML.footer,
            info    : info,
            filename: templatePath
        };

        // render page and send it as response
        req.specData.renderedHtml = ejs.render(template, templateJSON);
    }

    // proceed to next middleware
    next();
};