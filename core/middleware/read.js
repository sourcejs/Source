'use strict';

var fs = require('fs-extra');
var path = require('path');
var ejs = require('ejs');
var specUtils = require(path.join(global.pathToApp,'core/lib/specUtils'));
var configUtils = require(path.join(global.pathToApp,'core/lib/configUtils'));

//var config = {};

/**
 * Checking if Spec is requested
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function(req, res, next) {
    var apiRe = new RegExp('^/api/');
    var sourceRe = new RegExp('^/sourcejs/');
    var reqExt = path.extname(req.path);

    // Check if folder is requested but not the reserved namespaces
    if (reqExt === "" && !apiRe.test(req.path) && !sourceRe.test(req.path)) {
        var specPath = specUtils.getFullPathToSpec(req.path);
        var contextOptions = configUtils.getContextOptions(req.path);
        var specFiles = contextOptions.info && contextOptions.info.specFile ? [contextOptions.info.specFile] : contextOptions.core.common.specFiles;

        var physicalPath = specUtils.getSpecFromDir(specPath, specFiles);
        var specFile = typeof physicalPath === 'string' ? path.basename(physicalPath) : undefined;

        if (specFile === 'index.html' || !physicalPath) {
            next();
            return;
        }

        fs.readFile(physicalPath, 'utf8', function (err, data) {
            if (err) {
                res.send(err);
                return;
            }

            // Filled during middleware processing
            req.specData = {};

            var infoJson = contextOptions.info || {
                title: 'No '+ contextOptions.core.common.infoFile +' defined'
            };

            var specFileExtension = path.extname(physicalPath).replace(".", "");
            var capitalizedExtension = specFileExtension.charAt(0).toUpperCase() + specFileExtension.slice(1);

            data = data.replace(/^\s+|\s+$/g, '');

            // Pre-render Spec contents with EJS
            if (!infoJson.noEjs) {
                try {
                    data = ejs.render(data, {
                        info: infoJson,
                        filename: physicalPath
                    });
                } catch(err){
                    global.log.warn('Could not pre-render spec with EJS: ' + req.path, err);
                }
            }

            req.specData["is" + capitalizedExtension] = true;
            req.specData.info = infoJson; // add spec info object to request
            req.specData.contextOptions = contextOptions; // add context options to request
            req.specData.renderedHtml = data; // add spec content to request

            next();
        });
    } else {
        next();
    }
};