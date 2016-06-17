'use strict';

var fs = require('fs-extra');
var path = require('path');

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
    var reqExt = path.extname(req.path);

    // Skip static resources, and dirs without trailing slash
    if (reqExt !== "" || (reqExt === "" && req.path.slice(-1) !== '/')) {
        next();
        return;
    }

    var apiRe = new RegExp('^/api/');
    var sourceRe = new RegExp('^/sourcejs/');

    // Check if folder is requested but not the reserved namespaces
    if (!apiRe.test(req.path) && !sourceRe.test(req.path)) {
        var specPath = specUtils.getFullPathToSpec(req.path);

        if (!fs.existsSync(specPath)) {
            next();
            return;
        }

        global.specLoadTime = process.hrtime();

        var contextOptions = configUtils.getContextOptions(req.path);

        var specFiles = contextOptions.specInfo && contextOptions.specInfo.specFile ? [contextOptions.specInfo.specFile] : contextOptions.rendering.specFiles;

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

            var specInfo = contextOptions.specInfo || {
                title: 'No '+ contextOptions.core.common.infoFile +' defined'
            };

            var capitalizedExtension;
            if (/.src.html$/.test(physicalPath)) {
                capitalizedExtension = 'Src';
            } else {
                var specFileExtension = path.extname(physicalPath).replace(".", "");
                capitalizedExtension = specFileExtension.charAt(0).toUpperCase() + specFileExtension.slice(1);
            }

            req.specData["is" + capitalizedExtension] = true;
            req.specData.info = specInfo; // add spec info object to request
            req.specData.contextOptions = contextOptions; // add context options to request
            req.specData.renderedHtml = data; // add spec content to request

            next();
        });
    } else {
        next();
    }
};
