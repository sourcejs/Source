var fs = require('fs'),
    ejs = require('ejs'),
    path = require('path'),
    root = path.dirname(require.main.filename),
    getHeaderAndFooter = require(root + '/core/headerFooter').getHeaderAndFooter;

var userTemplatesDir = root + "/user/views/",
    coreTemplatesDir = root + "/core/views/";

/*
* check if requested file is *.src and render
* */
exports.process = function (req, res, next) {
    handleRequest(req, res, next)
};

function handleRequest(req, res, next) {
    var physicalPath = global.app.get('specs path') + req.url; // get the physical path of a requested file

    var directory = path.dirname(physicalPath); // get the dir of a requested file
    //var filename = path.basename(physicalPath); // filename of a requested file
    var extension = path.extname(physicalPath); // extension of a requested file
    var infoJson = directory + '/' + global.opts.src.infoFile;

    if (extension == ".src") {
        fs.exists(physicalPath, function(exists) {

            if (exists) {
                fs.readFile(physicalPath, 'utf8', function (err, data) {
                    if (err) {
                        res.send(err);
                    } else {

                        var info = {
                            title: "New spec",
                            author: "Anonymous",
                            keywords: ""
                        };

                        if (fs.existsSync(infoJson)) {
                            // avoid caching of require if it is already cached
                            if (typeof require.cache[infoJson] === 'object') {
                                delete require.cache[infoJson];
                            }

                            info = require(infoJson);
                        }

                        var headerFooterHTML = getHeaderAndFooter();

                        var template;

                        if (info.role === 'navigation') {
                            if (fs.existsSync(userTemplatesDir + "navigation.ejs")) {
                                template = fs.readFileSync(userTemplatesDir + "navigation.ejs", "utf-8");
                            } else {
                                template = fs.readFileSync(coreTemplatesDir + "navigation.ejs", "utf-8");
                            }
                        } else {
                            if (fs.existsSync(userTemplatesDir + "spec.ejs")) {
                                template = fs.readFileSync(userTemplatesDir + "spec.ejs", "utf-8");
                            } else {
                                template = fs.readFileSync(coreTemplatesDir + "spec.ejs", "utf-8");
                            }
                        }

                        var templateJSON = {
                            content: data,
                            header: headerFooterHTML.header,
                            footer: headerFooterHTML.footer
                        };

                        templateJSON.title = info.title ? info.title : "New spec";
                        templateJSON.author = info.author ? info.author : "Anonymous";
                        templateJSON.keywords = info.keywords ? info.keywords : "";

                        var html = ejs.render(template, templateJSON);

                        res.send(html);
                    }

                });

            } else {
                next();
            }
        });
    } else if (extension == "") {
        fs.exists(physicalPath + "index.src", function(exists) {
            var requestedDir = req.url;

            if (requestedDir.slice(-1) != '/') {
                requestedDir += '/';
            }
            if (exists) {
                //res.redirect(requestedDir + "index.src");
                handleRequest({
                    url: requestedDir + "index.src"
                }, res, next)
            } else {
                next();
            }
        });
    } else {
        next();
    }
}