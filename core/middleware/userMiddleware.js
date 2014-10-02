'use strict';

/**
 *
 * Loading user middleware
 *
 * */

var fs = require('fs');
var path = require('path');
var pathToUserMiddleware = path.join(global.app.get('user'), 'node_modules');

// Loading all sourcejs-*/core/index.js files from npm plugins section
if (fs.existsSync(pathToUserMiddleware)) {
    var userMiddlewareFiles = fs.readdirSync(pathToUserMiddleware);

    userMiddlewareFiles.map(function (file) {
        if ((/^sourcejs-/).test(file)) {
            var pluginIndexPath = path.join(pathToUserMiddleware, file, 'core/middleware', file, 'index.js');
            if (fs.existsSync(pluginIndexPath)) {
                var middleware = require(pluginIndexPath);
                global.app.use(middleware.process);
            }
        }
    });
}