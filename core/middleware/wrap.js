'use strict';

var fs = require('fs-extra');
var ejs = require('ejs');
var jsdom = require('jsdom');
var path = require('path');
var viewResolver = require(path.join(global.pathToApp + '/core/lib/viewResolver.js'));
var getHeaderAndFooter = require(global.pathToApp + '/core/headerFooter.js').getHeaderAndFooter;
var specUtils = require(path.join(global.pathToApp,'core/lib/specUtils'));

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
        var specDir = specUtils.getFullPathToSpec(req.url);
        var contextOptions = req.specData.contextOptions;

        // get spec content
        var data = req.specData.renderedHtml.replace(/^\s+|\s+$/g, '');

        // get spec info
        var info = req.specData.info;

        // choose the proper template, depending on page type or defined path
        var viewParam = 'spec';
        var context;

        if (info.template) {
            viewParam = info.template;
            context = specDir;
        } else if (info.role === 'navigation') {
            viewParam = 'navigation';
        }

        var templatePath = viewResolver(viewParam, contextOptions.rendering.views, context) || viewParam;

        fs.readFile(templatePath, "utf-8", function(err, template){
            if (err) {
                res.send('EJS template "' + templatePath + '" not found. Please check view configuration.');

                return;
            }

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

                    // make sure the body is not passed again once the head is removed
                    specData = specData.getElementsByTagName('body')[0];

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

                    req.specData.renderedHtml += '<!-- SourceJS version: ' + global.engineVersion + ' -->';

                    next();
                }
            );
        });
    } else {
        // proceed to next middleware
        next();
    }
};