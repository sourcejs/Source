'use strict';

var fs = require('fs');
var ejs = require('ejs');
var jsdom = require('jsdom');
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
    var output;

    if (fs.existsSync(userTemplatesDir + name)) {
        output = userTemplatesDir + name;
    } else if (fs.existsSync(coreTemplatesDir + name)) {
        output = coreTemplatesDir + name;
    } else {
        output = name;
    }

    return output;
}

/**
 * Wrap rendered html from request with spec wrapper (header, footer, etc.)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function (req, res, next) {

    // Check if we're working with processed file
    if (req.specData && req.specData.renderedHtml) {
        // get spec content
        var data = req.specData.renderedHtml.replace(/^\s+|\s+$/g, '');

        // get spec info
        var info = req.specData.info;

        // choose the proper template, depending on page type
        var template, templatePath;
        if (info.template) {
            templatePath = getTemplateFullPath(info.template + ".ejs");
        } else if (info.role === 'navigation') {
            templatePath = getTemplateFullPath("navigation.ejs");
        } else {
            templatePath = getTemplateFullPath("spec.ejs");
        }

        template = fs.readFile(templatePath, "utf-8", function(err, template){
            if (err) {
                res.send('EJS template "' + templatePath + '" not found in `core/views` and `user/core/views`.');

                return;
            }

            // if the following fields are not set, set them to defaults
            info.title = info.title ? info.title : "New spec";
            info.author = info.author ? info.author : "Anonymous";
            info.keywords = info.keywords ? info.keywords : "";

            // TODO: remove JSDom
            jsdom.env(
                '<html id="data">'+data+'</html>',
                function (errors, window) {
                    // get header and footer
                    var headerFooterHTML = getHeaderAndFooter();

                    // get head contents from spec file source
                    var headHook = window.document.getElementsByTagName('head')[0];
                    var specData = window.document.getElementById('data');
                    var head = '';

                    if (headHook) {
                        head = headHook.innerHTML;

                        specData.removeChild(headHook);
                    }

                    // final data object for the template
                    var templateJSON = {
                        content: specData.innerHTML,
                        head: head,
                        header: headerFooterHTML.header,
                        footer: headerFooterHTML.footer,
                        info: info,
                        filename: templatePath
                    };

                    // render page and send it as response
                    req.specData.renderedHtml = ejs.render(template, templateJSON);

                    next();
                }
            );
        });
    } else {
        // proceed to next middleware
        next();
    }
};