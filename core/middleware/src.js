var fs = require('fs'),
    ejs = require('ejs'),
    path = require('path'),
    pathToApp = path.dirname(require.main.filename),
    getHeaderAndFooter = require(pathToApp + '/core/headerFooter.js').getHeaderAndFooter;

var userTemplatesDir = global.app.get('user') + "/core/views/",
    coreTemplatesDir = pathToApp + "/core/views/";

var handleRequest = function(req, res, next) {
    var physicalPath = global.app.get('user') + req.url; // get the physical path of a requested file

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

                            var headerFooterHTML = getHeaderAndFooter();

                            var getTemplate = function(name){
                                var output;

                                if (fs.existsSync(userTemplatesDir + name)) {
                                    output = fs.readFileSync(userTemplatesDir + name, "utf-8");
                                } else {
                                    output = fs.readFileSync(coreTemplatesDir + name, "utf-8");
                                }

                                return output;
                            };

                            var template;

                            if (info.template) {
                                template = getTemplate(info.template + '.ejs');
                            } else if (info.role === 'navigation') {
                                template = getTemplate("navigation.ejs");
                            } else {
                                template = getTemplate("spec.ejs");
                            }

                            var templateJSON = {
                                content: data,
                                header: headerFooterHTML.header,
                                footer: headerFooterHTML.footer
                            };

                            templateJSON.title = info.title ? info.title : "New spec";
                            templateJSON.author = info.author ? info.author : "Anonymous";
                            templateJSON.keywords = info.keywords ? info.keywords : "";

                            req.renderedHtml = ejs.render(template, templateJSON);

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
* */
exports.process = function (req, res, next) {
    handleRequest(req, res, next)
};

/*
* if URL ends with "index.src" => redirect to trailing slash
* */
exports.handleIndex = function (req, res, next) {
    if (req.url.slice(-9) === 'index.src') {
        res.redirect(301, req.url.slice(0, -9));
    }

    next();
};
