'use strict';

var fs = require('fs');
var path = require('path');
var pathToApp = path.dirname(require.main.filename);

/**
 * Handling Spec request
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
var handleSpec = function(req, res, next) {
    // Filled during middleware processing
    req.specData = {};

    // Get the physical path of a requested file
    var physicalPath = global.app.get('user') + req.path;

    // TODO: move to config with array of exclusions
    if (req.path.lastIndexOf('/docs/', 0) === 0) {
        physicalPath = pathToApp + req.path;
    }

    // Extension of a requested file
    var extension = path.extname(physicalPath).replace(".", "");
    var directory = path.dirname(physicalPath); // get the dir of a requested file
    var supportedExtensions = global.opts.core.common.extensions;
    var extIndex = supportedExtensions.indexOf(extension);

    var infoJson = directory + '/' + global.opts.core.common.infoFile;

    // in case if one of supported file types is requested
    if (extIndex >= 0) {
        fs.exists(physicalPath, function(exists) {

            if (exists) {
                fs.readFile(physicalPath, 'utf8', function (err, data) {
                    data = data.replace(/^\s+|\s+$/g, '');

                    if (err) {
                        res.send(err);
                    } else {
                        fs.readFile(infoJson, 'utf8', function (err, info) {
                            if (err) {
                                info = {
                                    title: "New spec",
                                    author: "Anonymous",
                                    keywords: ""
                                };
                            } else {
                                info = JSON.parse(info);
                            }

                            // if requested file is one of supported file types, then write proper flag to request. f.e. req.specData.isJade; // true
                            if (extension === supportedExtensions[extIndex]) {
                                var capitalizedExtension = extension.charAt(0).toUpperCase() + extension.slice(1);
                                req.specData["is" + capitalizedExtension] = true;
                            }

                            req.specData.info = info; // add spec info object to request
                            req.specData.renderedHtml = data; // add spec content to request

                            next();
                        });
                    }

                });

            } else {
                next();
            }
        });
    } else {
        next();
    }
};

/**
 * Checking if Spec is requested
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function(req, res, next) {
    // Get the physical path of a requested file
    var physicalPath = global.app.get('user') + req.path;

    // TODO: move to config with array of exclusions
    if (req.path.lastIndexOf('/docs/', 0) === 0) {
        physicalPath = pathToApp + req.path;
    }

    // Extension of a requested file
    var extension = path.extname(physicalPath).replace(".", "");

    // Check if folder is requested
    if (extension === "") {
        var requestedDir = req.path;
        var supportedExtensions = global.opts.core.common.extensions;

        // Append trailing slash
        if (requestedDir.slice(-1) !== '/') {
            requestedDir += '/';
        }

        var specNotFileFound = true;
        var checkingSpecFile = function(supportedIndexFormat){
            if (specNotFileFound && fs.existsSync(physicalPath + supportedIndexFormat)) {
                // Passing req params
                var urlParams = req.url.split('?')[1];
                var paramsString = urlParams ? '?' + urlParams : '';

                req.url = requestedDir + supportedIndexFormat + paramsString;

                // Recursive call
                handleSpec(req, res, next);

                specNotFileFound = false;
            }
        };

        // First check if any supported file exists in dir
        for (var j = 0; j < supportedExtensions.length; j++) {
            if (specNotFileFound) {
                var supportedIndexFormat = "index." + supportedExtensions[j];

                checkingSpecFile(supportedIndexFormat);
            } else {
                break;
            }
        }

        // Then check if component have readme.md
        checkingSpecFile('readme.md');

        if (specNotFileFound) next();

    } else {
        next();
    }
};

/**
 * if URL ends with "index.src" => redirect to trailing slash
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.handleIndex = function (req, res, next) {

    // TODO: add rederection for any supported extensions
    if (req.path.slice(-9) === 'index.src') {
        // Keeping params on redirect
        var urlParams = req.url.split('?')[1];
        var paramsSting = urlParams ? '?' + urlParams : '';
        res.redirect(301, req.path.slice(0, -9) + paramsSting);
    } else {
        next();
    }
};
