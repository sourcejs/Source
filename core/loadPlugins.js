'use strict';

/*
 *
 * Loading SourceJS plugins
 *
 * */

var fs = require('fs');
var path = require('path');
var pathToModules = path.join(global.userPath, 'node_modules');

// Loading all sourcejs-*/core/index.js files from npm plugins section
if (fs.existsSync(pathToModules)) {
    var userModulesFiles = fs.readdirSync(pathToModules);

    userModulesFiles.map(function(file){
        if ((/^sourcejs-/).test(file)) {
            var pluginIndexPath = path.join(pathToModules, file, 'core','index.js');

            if(fs.existsSync(pluginIndexPath)) {
                try {
                    require(pluginIndexPath);
                } catch (e) {
                    console.log("User plugins require error: ", e, ' from:', pluginIndexPath);
                }
            }
        }
    });
}
