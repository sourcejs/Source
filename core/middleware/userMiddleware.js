/*
 *
 * Loading user middleware
 *
 * */

var fs = require('fs');
var path = require('path');
var pathToUserMiddleware = path.join(global.app.get('user'), 'core/middleware');
var userMiddlewareFiles = fs.readdirSync( pathToUserMiddleware );

// Loading all sourcejs-*/core/index.js files from npm plugins section
console.log("LOAD");
userMiddlewareFiles.map(function(file){
    if ((/^sourcejs-/).test(file)) {
        var pluginIndexPath = path.join(pathToUserMiddleware, file, 'index.js');

        if(fs.existsSync(pluginIndexPath)) {
            var middleware = require(pluginIndexPath);
            global.app.use(middleware.process);
        }
    }
});