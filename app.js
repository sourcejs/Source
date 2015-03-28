/*!
* SourceJS - Living Style Guides Engine and Integrated Maintenance Environment for Front-end Components
* @copyright 2013-2015 Sourcejs.com
* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
* */

var express = require('express');
var colors = require('colors');
var fs = require('fs');
var loadOptions = require('./core/loadOptions');
var commander = require('commander');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

/* Globals */
global.app = express();
global.opts = loadOptions();

// Arguments parse */
commander
    .option('-l, --log [string]', 'Log level (default: ' + global.opts.core.common.defaultLogLevel + ')',  global.opts.core.common.defaultLogLevel)
    .option('-p, --port [number]', 'Server port (default: ' + global.opts.core.common.port + ')', global.opts.core.common.port)
    .option('--html', 'Turn on HTML parser on app start')
    .parse(process.argv);

global.commander = commander;

global.app.set('views', __dirname + '/core/views');
global.app.set('user', __dirname + '/' + global.opts.core.common.pathToUser);

// We support `development` (default), `production` and `presentation` (for demos)
global.MODE = process.env.NODE_ENV || 'development';

global.pathToApp = __dirname;

// Default logger
var logger = require('./core/logger');
var log = logger.log;
global.log = log;

if (commander.html) global.opts.core.parseHTML.onStart = true;
if (commander.port) global.opts.core.common.port = parseInt(commander.port);
/* /Globals */


/* App config */

// Optimization
global.app.use(require('compression')());

// Cookies
global.app.use(require('cookie-parser')());
global.app.use(require('express-session')({
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
var faviconPath = global.app.get('user') + '/favicon.ico';
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
global.app.use(require('./core/middleware/clarify'));

// File tree module
var fileTree = require('./core/file-tree');

// Run file tree scan on start
fileTree.scan();

// Run file tree scan on main page visit
if (global.opts.core.fileTree.mainPageTrigger && global.MODE !== 'presentation') {
    global.app.use(function(req, res, next){

        // Updating navigation on each main page visit
        if (req.url === "/") fileTree.scan();

        next();
    });
}


// Middleware that loads spec content
var read = require("./core/middleware/read");
global.app.use(read.process);

// Markdown
global.app.use(require("./core/middleware/md").process);
global.app.use(require("./core/middleware/mdTag").process);

// Load user defined middleware, that processes spec content
require("./core/middleware/userMiddleware");

// Middleware that wraps spec with Source template
global.app.use(require("./core/middleware/wrap").process);

// Middleware that sends final spec response
global.app.use(require("./core/middleware/send").process);

/* /Middlewares */



/* Includes */

// Routes
require('./core/routes');

// API
require('./core/api');

global.app.use('/api/options', function(req, res){
    res.jsonp(loadOptions().assets);
});

// User extenstions
require("./core/loadPlugins.js");

try {
    // User additional functionality
    require(global.app.get('user') + "/core/app.js");
} catch(e){}


// Watchers
if (global.opts.core.watch.enabled && global.MODE === 'development') {
    require('./core/watchNewSpecs');
}

/* /Includes */



/* Serving content */
var headerFooter = require('./core/headerFooter');

// Static content
global.app.use(express.static(global.app.get('user')));

// Page 404
global.app.use(function(req, res){

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

global.app.use(logErrors);
/* /Error handling */



// Server start
if (!module.parent) {
    var port = global.opts.core.common.port;

    global.app.listen(port);
    var portString = port.toString();

    log.info('[SOURCEJS] launched on http://127.0.0.1:'.blue + portString.red + ' in '.blue + MODE.blue + ' mode...'.blue);
}
