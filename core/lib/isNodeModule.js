'use strict';

var path = require('path');
var fs = require('fs-extra');

if (typeof global.isNodeModule === 'undefined') {
    module.exports = function (customPathToApp) {
        var pathToApp = customPathToApp || global.pathToApp;
        var grantParentPath = path.join(pathToApp, '../../');
        var relativePathToApp = path.relative(grantParentPath, pathToApp);
        var assumedSourceNpmPath = path.join('node_modules', fs.readJsonSync(path.join(pathToApp, 'package.json')).name);

        return relativePathToApp === assumedSourceNpmPath;
    };
} else {
    module.exports = function() {
        return global.isNodeModule;
    };
}
