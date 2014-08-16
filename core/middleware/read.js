var fs = require('fs'),
    path = require('path'),
    pathToApp = path.dirname(require.main.filename);

/*
* Считываем контент спеки и записываем его в реквест
*
* @param {object} req - Request object
* @param {object} res - Response object
* @param {function} next - The callback function
* */
var handleRequest = function(req, res, next) {
    req.specData = {};

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

    /* если запрашивается файл */
    if (extension == ".src") {
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

                            req.specData.info = info; // записываем инфу о спеке в реквест
                            req.specData.renderedHtml = data; // записываем контент спеки в реквест

                            next();
                        });
                    }

                });

            } else {
                next();
            }
        });
    }
    /* если запрашивается директория */
    else if (extension == "") {
        fs.exists(physicalPath + "index.src", function(exists) {
            var requestedDir = req.url;

            if (requestedDir.slice(-1) != '/') {
                requestedDir += '/';
            }
            if (exists) {
                /* подменяем урл в запросе */
                req.url = requestedDir + "index.src";

                /* рекурсивно вызываем handleRequest с запросом на конкретный файл */
                handleRequest(req, res, next)
            } else {
                next();
            }
        });
    } else {
        next();
    }
};

/*
* check if requested file is *.src and render
*
* @param {object} req - Request object
* @param {object} res - Response object
* @param {function} next - The callback function
* */
exports.process = function (req, res, next) {
    handleRequest(req, res, next)
};

/*
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
