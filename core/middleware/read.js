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
    var physicalPath = path.join(global.app.get('user'), req.path);

    // TODO: move to config with array of exclusions
    if (req.path.lastIndexOf('/docs/', 0) === 0) {
        physicalPath = pathToApp + req.path;
    }

    // Extension of a requested file
    var extension = path.extname(physicalPath).replace(".", "");
    var directory = path.dirname(physicalPath); // get the dir of a requested file

    var infoJson = directory + '/' + global.opts.core.common.infoFile;

    fs.readFile(physicalPath, 'utf8', function (err, data) {
        if (err) {
            res.send(err);
            return;
        }

        data = data.replace(/^\s+|\s+$/g, '');

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

            var capitalizedExtension = extension.charAt(0).toUpperCase() + extension.slice(1);

            req.specData["is" + capitalizedExtension] = true;
            req.specData.info = info; // add spec info object to request
            req.specData.renderedHtml = data; // add spec content to request

            next();
        });
    });
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

                // Modifying url and saving params string
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