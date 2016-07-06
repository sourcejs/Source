'use strict';

var fs = require('fs-extra');
var path = require('path');
var cheerio = require('cheerio');
var _ = require('lodash');

var ejs = require(path.join(global.pathToApp, 'core/ejsWithHelpers.js'));
var viewResolver = require(path.join(global.pathToApp + '/core/lib/viewResolver.js'));
var getHeaderAndFooter = require(global.pathToApp + '/core/headerFooter.js').getHeaderAndFooter;
var specUtils = require(path.join(global.pathToApp, 'core/lib/specUtils'));

/**
 * Wrap rendered html from request with spec wrapper (header, footer, etc.)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 *
 */
exports.process = function (req, res, next) {
    req.placeholders = req.placeholders || {};
	req.placeholders.head = req.placeholders.head || [];

    req.placeholders.precontent = req.placeholders.precontent || [];
    req.placeholders.maincontent = req.placeholders.maincontent || [];
    req.placeholders.sidecontent = req.placeholders.sidecontent || [];
    req.placeholders.postcontent = req.placeholders.postcontent || [];

    // Check if we're working with processed file
    if (req.specData && req.specData.renderedHtml) {
        var specDir = specUtils.getFullPathToSpec(req.path);
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

        // Check if we're working with included dirs
        if (context) {
            global.opts.core.common.includedDirs.forEach(function (includedDir) {
                var pathToCheck = (path.join(global.userPath, includedDir) + '/').replace(/\\/g, '/');

                if (context.indexOf(pathToCheck) === 0) {
                    context = context.replace(pathToCheck, path.join(global.pathToApp, includedDir) + '/');
                }
            });
        }

        var templatePath = viewResolver(viewParam, contextOptions.rendering.views, context) || viewParam;

        fs.readFile(templatePath, 'utf-8', function (err, template) {
            if (err) {
                res.send('EJS template "' + templatePath + '" not found. Please check view configuration.');

                return;
            }

            var $ = cheerio.load(data, { decodeEntities: false });

            var head = '';
            var $headHook = $('head');

            if ($headHook.length > 0) {
                head = $headHook.html();

                $('head').remove();
            }
			req.placeholders.head = _.concat(req.placeholders.head, head);

            var content = '';
            var $body = $('body');
            var $html = $('html');

            if ($body.length > 0) {
                content = $body.html();
            } else if ($html.length > 0) {
                content = $html.html();
            } else {
                content = $.html();
            }
            req.placeholders.maincontent = _.concat(req.placeholders.maincontent, content);

            // Render Header & Footer and prepend them to the placeholders
            // TODO needs to be moved into seperate middleware? getting a proper place for data
            var headerFooter = getHeaderAndFooter();
            try {
                req.placeholders.precontent = _.concat(req.placeholders.precontent, ejs.render(headerFooter.header, {}, {
                    filename: headerFooter.headerPath
                }));
            } catch (err) {
                var headerMsg = 'wrap.js: could not render EJS header template: ' + headerFooter.headerPath;
                global.log.warn(headerMsg, err.stack);
            }
            try {
                req.placeholders.postcontent = _.concat(ejs.render(headerFooter.footer, {}, {
                    filename: headerFooter.footerPath
                }), req.placeholders.postcontent);
            } catch (err) {
                var footerMsg = 'wrap.js: could not render EJS footer template: ' + headerFooter.footerPath;
                global.log.warn(footerMsg, err.stack);
            }

            // convert placeholder contents to string
            var placeholders = _.transform(req.placeholders, function (result, value, key) {
                result[key] = value.map(function (item) {
                    return item.toString();
                }).join('');
            }, {});

            // final data object for the template
            var templateJSON = _.extend({}, placeholders, {
                engineVersion: global.engineVersion,
            }, {
                info: info,
            });

            // render page and send it as response
            try {
                req.specData.renderedHtml = ejs.render(template, templateJSON, {
                    filename: templatePath,
                });
            } catch (err) {
                global.log.error('wrap.js: could not render Spec with EJS: ' + templatePath + ' on: ' + req.path, err);
                req.specData.renderedHtml = 'Error rendering Spec with EJS: <noscript>' + template + '</noscript>';
            }

            req.specData.renderedHtml += '\n<!-- SourceJS version: ' + global.engineVersion + ' -->';

            next();
        });
    } else {
        // proceed to next middleware
        next();
    }
};
