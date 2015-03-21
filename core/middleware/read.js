'use strict';

var fs = require('fs');
var path = require('path');
var url = require('url');
var ejs = require('ejs');
var pathToApp = path.dirname(require.main.filename);

var config = {
    includedDirs: ['docs']
};

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
            var parsedUrl = url.parse(req.url);
            var urlPath = parsedUrl.pathname.replace(/\\/g, '/');
            var specPath = path.join(global.app.get('user'), urlPath).replace(/\\/g, '/');

            // Including non-standard paths, outside default static route
            config.includedDirs.forEach(function(item){
                if (urlPath.split('/')[1] === item) {
                    specPath = specPath.replace('/'+ global.opts.core.common.pathToUser + '/', '/');
                }
            });

            // Pre-render Spec contents with EJS
            if (!info.noEjs) {

                try {
                    data = ejs.render(data, {
                        info: info,
                        filename: specPath
                    });
                } catch(err){
                    global.log.warn('Could not pre-render spec with EJS: ' + urlPath, err);
                }
            }

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
        var specFiles = global.opts.core.common.specFiles;

        // Append trailing slash
        if (requestedDir.slice(-1) !== '/') {
            requestedDir += '/';
        }

        var noSpecFound = true;
        var checkingSpecFile = function(supportedIndexFormat){
            // Skip index.html and check if file exists
            if (supportedIndexFormat !== 'index.html' && fs.existsSync(physicalPath + supportedIndexFormat)) {
                // Passing req params
                var urlParams = req.url.split('?')[1];
                var paramsString = urlParams ? '?' + urlParams : '';

                // Modifying url and saving params string
                req.url = requestedDir + supportedIndexFormat + paramsString;

                // Recursive call
                handleSpec(req, res, next);

                noSpecFound = false;
            }
        };

        // First check if any supported file exists in dir
        for (var j = 0; j < specFiles.length; j++) {
            if (noSpecFound) {
                var supportedIndexFormat = specFiles[j];

                checkingSpecFile(supportedIndexFormat);
            } else {
                break;
            }
        }

        if (noSpecFound) next();

    } else {
        next();
    }
};