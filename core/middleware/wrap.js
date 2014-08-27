var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var pathToApp = path.dirname(require.main.filename);
var getHeaderAndFooter = require(pathToApp + '/core/headerFooter.js').getHeaderAndFooter;
var userTemplatesDir = global.app.get('user') + "/core/views/";
var coreTemplatesDir = pathToApp + "/core/views/";

/**
 * Get template: default or user-defined if it exists.
 *
 *
 * @param {string} name - Template name
 * @returns {string}
 * */
function getTemplate(name) {
    var output;

    if (fs.existsSync(userTemplatesDir + name)) {
        output = fs.readFileSync(userTemplatesDir + name, "utf-8");
    } else {
        output = fs.readFileSync(coreTemplatesDir + name, "utf-8");
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

    if (req.specData && req.specData.renderedHtml) {
        // get spec content
        var data = req.specData.renderedHtml.replace(/^\s+|\s+$/g, '');

        // get spec info
        var info = req.specData.info;

        // get header and footer
        var headerFooterHTML = getHeaderAndFooter();

        // choose the proper template, depending on page type
        var template;
        if (info.template) {
            template = getTemplate(info.template + '.ejs');
        } else if (info.role === 'navigation') {
            template = getTemplate("navigation.ejs");
        } else {
            template = getTemplate("spec.ejs");
        }

        // if the following fields are not set, set them to defaults
        info.title = info.title ? info.title : "New spec";
        info.author = info.author ? info.author : "Anonymous";
        info.keywords = info.keywords ? info.keywords : "";

        // final data object for the template
        var templateJSON = {
            content : data,
            header  : headerFooterHTML.header,
            footer  : headerFooterHTML.footer,
            info    : info
        };

        // render page and send it as response
        req.specData.renderedHtml = ejs.render(template, templateJSON);
    }

    // proceed to next middleware
    next();
};