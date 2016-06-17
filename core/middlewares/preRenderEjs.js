'use strict';

var path = require('path');
var ejs = require(path.join(global.pathToApp, 'core/ejsWithHelpers.js'));
var specUtils = require(path.join(global.pathToApp,'core/lib/specUtils'));

/**
 * Processing pre-ejs rendering on spec request
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function(req, res, next) {
    // Check if spec is request and ejs pre-rendering enabled
    if (req.specData && req.specData.renderedHtml) {
        var specInfo = req.specData.info;

        if (specInfo.noEjs) {
            next();
            return;
        }

        var specPath = specUtils.getFullPathToSpec(req.path);
        var contextOptions = req.specData.contextOptions;
        var specFiles = contextOptions.specInfo && contextOptions.specInfo.specFile ? [contextOptions.specInfo.specFile] : contextOptions.rendering.specFiles;
        var physicalPath = specUtils.getSpecFromDir(specPath, specFiles);
        var processedData = req.specData.renderedHtml.replace(/^\s+|\s+$/g, '');

        try {
            processedData = ejs.render(processedData, {
                engineVersion: global.engineVersion,
                info: req.specData.info
            }, {
                filename: physicalPath
            });
        } catch(err){
            global.log.warn('Could not pre-render spec with EJS: ' + req.path, err);
        }
        req.specData.renderedHtml = processedData;

        next();
    } else {
        next();
    }
};
