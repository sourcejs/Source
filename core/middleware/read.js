var fs = require('fs');
var path = require('path');
var pathToApp = path.dirname(require.main.filename);

/**
 * Get spec content and write it to request
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
var handleRequest = function(req, res, next) {
    req.specData = {};
    req.specData.isJade = false;
    req.specData.isHaml = false;

    // get the physical path of a requested file
    var physicalPath = global.app.get('user') + req.url;

    // TODO: move to config with array of exclusions
    if (req.url.lastIndexOf('/docs/', 0) === 0) {
        physicalPath = pathToApp + req.url;
    }

    var directory = path.dirname(physicalPath); // get the dir of a requested file
    //var filename = path.basename(physicalPath); // filename of a requested file
    var extension = path.extname(physicalPath); // extension of a requested file
    var infoJson = directory + '/' + global.opts.core.common.infoFile;

    // in case if a file is requested
    if (extension == ".src" || extension == ".jade" || extension == ".haml") {
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

                            // if requested file is *.jade, then write flag to request
                            if (extension == ".jade") {
                                req.specData.isJade = true;
                            }

                            if (extension == ".haml") {
                                req.specData.isHaml = true;
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
    }
    // if directory is requested
    else if (extension == "") {
        var requestedDir = req.url;

        // append trailing slash
        if (requestedDir.slice(-1) != '/') {
            requestedDir += '/';
        }

        var extensions = ["src", "jade", "haml"];
        var oneOfExtensionsFound = false;

        for (var j = 0; j < extensions.length; j++) {
            var fileName = "index." + extensions[j];

            if (fs.existsSync(physicalPath + fileName)) {
                req.url = requestedDir + fileName;

                // recursive call
                handleRequest(req, res, next);

                oneOfExtensionsFound = true;
                break;
            }
        }

        if (!oneOfExtensionsFound) {
            next();
        }

    } else {
        next();
    }
};

/**
 * check if requested file is *.src and render
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function (req, res, next) {
    handleRequest(req, res, next)
};

/**
 * if URL ends with "index.src" => redirect to trailing slash
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.handleIndex = function (req, res, next) {
    if (req.url.slice(-9) === 'index.src') {
        res.redirect(301, req.url.slice(0, -9));
    }

    next();
};
