/*
* Source - Front-end documentation engine
* @copyright 2013 Sourcejs.com
* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
* */

/* Module dependencies */
var express = require('express')
    , colors = require('colors')
    , fs = require('fs')
    , lessMiddleware = require('less-middleware')
    , os = require('os')
    , ejs = require('ejs')
    , headerFooter = require('./core/headerFooter');

global.app = express();
global.opts = require('./core/options/');

global.app.set('views', __dirname + '/core/views');
global.app.set('specs path', __dirname + '/' + global.opts.common.pathToSpecs);

/* LESS processing */
//TODO: add config and move to other module, and add configurable varibles (/public folder etc)
var tmpDir = os.tmpDir();
global.app.use(lessMiddleware({
    src: global.app.get('specs path'),
    dest: tmpDir,
    force: true
}));
/* /LESS processing */

/*  Clarify module */
var clarify = require('./core/clarify');
app.use(clarify);
app.use(express.static(__dirname + '/core/clarify')); // static for module css
/*  /Clarify module */

/*  File tree module */
fileTree = require('./core/file-tree');
global.app.use(function(req, res, next){
    if(req.url === "/") {
        fileTree.scan();
    }
    next();
});
/*  /File tree module */

/* Error handling */
global.app.use(logErrors);
global.app.use(clientErrorHandler);
global.app.use(errorHandler);

try {
    /* Routes */
    global.routes = require('./core/routes');

    /* User plugins */
    global.plugins = require("./user/plugins");

    /* User additional functionality */
    global.extApp = require("./user/app.js");
} catch(e) {
    console.log(e);
    process.exit(e.code);
}

/* serve static content */
global.app.use(express.static(global.app.get('specs path')));
app.use(express.static(tmpDir));

app.use(function(req, res, next){

	var path = req.url.replace('/index.html', '');

	if (req.accepts('html')) {

        var headerFooterHTML = headerFooter.getHeaderAndFooter();
		res.render(__dirname + '/core/views/404.ejs', {
			section: path,
            header: headerFooterHTML.header,
            footer: headerFooterHTML.footer
		})

		return;
	}

});

if (!module.parent) {
    global.app.listen(80);
    console.log('[SOURCE] is working on 80 port...'.blue);
}

function logErrors(err, req, res, next) {
    console.error(("Error: " + err.stack).red);
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.send(500, { error: 'Something blew up!' });
    } else {
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
}
