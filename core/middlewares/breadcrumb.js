'use strict';

var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');

var ejs = require(path.join(global.pathToApp, 'core/ejsWithHelpers.js'));
var viewResolver = require(path.join(global.pathToApp + '/core/lib/viewResolver.js'));
var specUtils = require(path.join(global.pathToApp,'core/lib/specUtils'));

/**
* Processing pre-ejs rendering on spec request
*
* @param {object} req - Request object
* @param {object} res - Response object
* @param {function} next - The callback function
* */
exports.process = function(req, res, next) {
    req.placeholders = req.placeholders || {};
    req.placeholders.precontent = req.placeholders.precontent || [];

    // Check if spec is request and ejs pre-rendering enabled
    if (req.specData && req.specData.renderedHtml) {
        var contextOptions = req.specData.contextOptions;

        var getData = function (specDir) {
            var infoFilePath = path.join(specDir, global.opts.core.common.infoFile);
            return fs.existsSync(infoFilePath) ? fs.readJsonSync(infoFilePath, {throws: false}) : undefined;
        };

        // breadcrumb data
        var data = req.path.split('/').reduce(function (result, item) {
            if (item === '' && result.length === 0) {
                return result.concat([{
                    name: 'Home',
                    path: '/'
                }]);
            } else if (item !== '') {
                return result.concat([{
                    name: item,
                    path: (result[result.length - 1].path + item + '/')
                }]);
            } else {
                return result;
            }
        }, []).map(function (item) {
            item.fullPath = specUtils.getFullPathToSpec(item.path);
            item.info = getData(item.fullPath) || {};
            item.title = item.info.title || item.name;
            return item;
        });

        var viewParam = 'breadcrumb';
        var templatePath = viewResolver(viewParam, contextOptions.rendering.views, undefined) || viewParam;

        fs.readFile(templatePath, "utf-8", function(err, template){
            var renderedBreadcrumps;

            try {
                renderedBreadcrumps = ejs.render(template, {
                    breadcrumb: data
                }, {
                    filename: templatePath
                });
            } catch (err) {
                renderedBreadcrumps = '';
                global.log.warn('breadcrumb.js: could not render breadcrumbs with EJS: ' + templatePath + ' on: ' + req.path, err);
            } finally {
                req.placeholders.precontent = _.concat(req.placeholders.precontent, renderedBreadcrumps);
                next();
            }
        });
    } else {
        next();
    }
};
