/*!
* SourceJS - Living Style Guides Engine and Integrated Maintenance Environment for Front-end Components
* @copyright 2013-2015 Sourcejs.com
* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
* */

'use strict';

var express = require('express');
var colors = require('colors'); // jshint ignore:line
var fs = require('fs-extra');
var path = require('path');
var commander = require('commander');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

/* Globals */
// Define absolute path to app, normalizing windows disk name
global.pathToApp = __dirname.replace(/^\w:\\/, function (match) {
    return match.toLowerCase();
});

var app = global.app = express();

var loadOptions = require('./core/loadOptions');
global.opts = loadOptions();

// Arguments parse */
commander
    .option('-l, --log [string]', 'Log level (default: ' + global.opts.core.common.defaultLogLevel + ').',  global.opts.core.common.defaultLogLevel)
    .option('-p, --port [number]', 'Server port (default: ' + global.opts.core.common.port + ').', global.opts.core.common.port)
    .option('--html', 'Turn on HTML parser on app start (requires installed and enabled parser).')
    .option('--test', 'Run app with tests.')
    .parse(process.argv);

global.commander = commander;

app.set('views', path.join(__dirname, 'core/views'));
app.set('user', path.join(__dirname, global.opts.core.common.pathToUser));

// We support `development` (default), `production` and `presentation` (for demos)
var MODE = global.MODE = process.env.NODE_ENV || 'development';

global.engineVersion = fs.readJsonSync(path.join(global.pathToApp, '/package.json'), {throws: false}).version;

// Default logger
var logger = require('./core/logger');
var log = logger.log;
global.log = log;

if (commander.html) global.opts.core.parseHTML.onStart = true;
if (commander.port) global.opts.core.common.port = parseInt(commander.port);
/* /Globals */


/* App config */

// Version
app.use(function (req, res, next) {
    res.header('X-powered-by', 'SourceJS ' + global.engineVersion);
    next();
});

// Optimization
app.use(require('compression')());

// Cookies
app.use(require('cookie-parser')());
app.use(require('express-session')({
    secret: (function() {
        var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    })(),
  resave: false,
  saveUninitialized: true
}));

app.use(function (req, res, next) {
    res.cookie('source-mode', global.MODE, { maxAge: 3600000, httpOnly: false });

    // keep executing the router middleware
    next();
});

// Favicon
var faviconPath = path.join(app.get('user'), 'favicon.ico');
if (fs.existsSync(faviconPath)){
    app.use(favicon(faviconPath));
}

app.use(bodyParser.json());
/* /App config */



/* Middlewares */

// Auth initializing
var auth = require('./core/auth')(app);
app.use(auth.everyauth.middleware());

// Clarify
app.use(require('./core/middleware/clarify'));

// File tree module
var fileTree = require('./core/file-tree');

// Run file tree scan on start
fileTree.scan();

// Run file tree scan on main page visit
if (global.opts.core.fileTree.mainPageTrigger && global.MODE !== 'presentation') {
    app.use(function(req, res, next){

        // Updating navigation on each main page visit
        if (req.url === '/') fileTree.scan();

        next();
    });
}

// Update file tree via api
app.use('/api/updateFileTree', function(req, res){
    fileTree.scan();

    res.jsonp({
        message: 'Navigation succesfully updated.'
    });
});


// Middleware that loads spec content
var read = require("./core/middleware/read");
app.use(read.process);

// Markdown
app.use(require("./core/middleware/md").process);
app.use(require("./core/middleware/mdTag").process);

// Load user defined middleware, that processes spec content
require("./core/middleware/userMiddleware");

// Middleware that wraps spec with Source template
app.use(require("./core/middleware/wrap").process);

// Middleware that sends final spec response
app.use(require("./core/middleware/send").process);

/* /Middlewares */



/* Includes */

// Routes
require('./core/routes');

// API
require('./core/api');
require('./core/api/optionsApi');

// User extenstions
require("./core/loadPlugins.js");

try {
    // User additional functionality
    require(app.get('user') + "/core/app.js");
} catch(e){}


// Watchers
if (global.opts.core.watch.enabled && global.MODE === 'development') {

    if (global.opts.core.watch.foreverWatchEnabled) {
        require('./core/watch');
    } else {
        require('./core/watch/childWatch');
    }
}

/* /Includes */



/* Serving content */
var headerFooter = require('./core/headerFooter');

// Static content
app.use(express.static(app.get('user')));

// Page 404
app.use(function(req, res){

	if (req.accepts('html')) {
        var headerFooterHTML = headerFooter.getHeaderAndFooter();
		res.status(404).render(path.join(__dirname, '/core/views/404.ejs'), {
            header: headerFooterHTML.header,
            footer: headerFooterHTML.footer
		});
	}

});
/* /Serving content */



/* Error handling */
var logErrors = function(err, req, res, next) {
    if (err) {
        var url = req.url || '';

        log.debug(req.method, req.headers);
        log.error(('Requested url: ' + url).red, ('Error: ' + err.stack).red);

        if (req.xhr) {
            res.status(500).json({msg: 'Server error'});
        } else {
            res.status(500).send('Server error');
        }
    } else {
        next();
    }
};

app.use(logErrors);
/* /Error handling */



// Server start
if (!module.parent) {
    var port = global.opts.core.common.port;

    app.listen(port);
    var portString = port.toString();

    log.info('[SOURCEJS] launched on http://127.0.0.1:'.blue + portString.red + ' in '.blue + MODE.blue + ' mode...'.blue);

    if (commander.test) {
        var spawn = require('cross-spawn');

        spawn('./node_modules/grunt-cli/bin/grunt', ['ci-post-run'], {stdio: 'inherit'})
            .on('close', function (code) {
                if (code === 0) {
                    log.info('Test successful');
                    process.exit(0);
                } else {
                    log.error('Test failed');
                    process.exit(1);
                }
            });
    }
}
