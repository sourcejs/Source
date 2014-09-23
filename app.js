/*!
* SourceJS - IME for front-end components documentation and maintenance
* @copyright 2014 Sourcejs.com
* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
* */

var express = require('express');
var colors = require('colors');
var fs = require('fs');
var deepExtend = require('deep-extend');
var headerFooter = require('./core/headerFooter.js');
var loadOptions = require('./core/loadOptions');
var commander = require('commander');

/* Globals */
global.app = express();
global.opts = loadOptions();

global.app.set('views', __dirname + '/core/views');
global.app.set('user', __dirname + '/' + global.opts.core.common.pathToUser);

global.MODE = process.env.NODE_ENV || 'development';
/* /Globals */



/* App config */

// Args
commander
  .option('-p, --port [number]', 'Server port (default: '+global.opts.core.common.port+')', global.opts.core.common.port)
  .parse(process.argv);

// Optimization
global.app.use(express.compress());

// Cookies
global.app.use(express.cookieParser());
app.use(function (req, res, next) {
    res.cookie('source-mode', global.MODE, { maxAge: 3600000, httpOnly: false });

    // keep executing the router middleware
    next();
});
/* /App config */



/* Middlewares */

// LESS processing
if (global.MODE === 'development') {
    var less = require('less-middleware');

    var lessOpts = {
        src: global.app.get('user')
    };

    deepExtend(lessOpts, global.opts.core.less);

    global.app.use(less(lessOpts));
}

// Clarify module
var clarify = require('./core/clarify');
global.app.use(clarify);
global.app.use(express.static(__dirname + '/core/clarify')); // static for module css


// Api first steps
global.app.use('/api/options', function(req, res){
    res.jsonp(loadOptions().assets);
});


// File tree module
fileTree = require('./core/file-tree');
global.app.use(function(req, res, next){
    if(req.url === "/") {
        fileTree.scan();
    }
    next();
});

// Middleware that loads spec content
var read = require("./core/middleware/read");
global.app.use(read.handleIndex);
global.app.use(read.process);

// Load user defined middleware, that processes spec content
require("./core/middleware/userMiddleware.js");

// Middleware that wraps spec with Source template
var wrap = require("./core/middleware/wrap");
global.app.use(wrap.process);

// Middleware that sends final spec response
var send = require("./core/middleware/send");
global.app.use(send.process);

/* /Middlewares */



/* Includes */

// Routes
require('./core/routes');

// User extenstions
try {
    /* User plugins */
    require("./core/plugins.js");

    /* User additional functionality */
    require(global.app.get('user') + "/core/app.js");
} catch(e){
    console.log("User plugins require error:", e);
}
/* /Includes */



/* Serving content */

// Static content
global.app.use(express.static(global.app.get('user')));

// Page 404
global.app.use(function(req, res, next){

	if (req.accepts('html')) {

        var headerFooterHTML = headerFooter.getHeaderAndFooter();
		res.status(404).render(__dirname + '/core/views/404.ejs', {
            header: headerFooterHTML.header,
            footer: headerFooterHTML.footer
		});
	}

});
/* /Serving content */



/* Error handling */
var logErrors = function(err, req, res, next) {
    console.error(("Error: " + err.stack).red);
    next(err);
};

var clientErrorHandler = function(err, req, res, next) {
    if (req.xhr) {
        res.send(500, { error: 'Something blew up!' });
    } else {
        next(err);
    }
};

var errorHandler = function(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
};

global.app.use(logErrors);
global.app.use(clientErrorHandler);
global.app.use(errorHandler);
/* /Error handling */



// Server start
if (!module.parent) {
    var port = global.opts.core.common.port;
    if (commander.port) {
        port = parseInt(commander.port);
    }

    global.app.listen(port);

    var portString = port.toString();

    var d = new Date(),
        dateArr = [d.getHours(), d.getMinutes(), d.getSeconds()],
        dateArr = dateArr.map(function (el) { return (el > 9)? el : '0'+ el; }),
        dateString = dateArr.join(':').red;

    console.log(dateString + ' [SOURCE] lauched on http://localhost:'.blue + portString.red + ' in '.blue + MODE.blue + ' mode...'.blue);
}