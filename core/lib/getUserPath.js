'use strict';

var path = require('path');
var fs = require('fs');
var pathToApp = global.pathToApp;
var isNodeModule = require('./isNodeModule');

module.exports = function(){
    var sourcePathFromParent = path.join(process.cwd(), 'node_modules/sourcejs');

    if (fs.existsSync(sourcePathFromParent)) {
        pathToApp = sourcePathFromParent;
    }

    var relativeUserPath = isNodeModule(pathToApp) ? '../../' : global.opts.core.common.pathToUser;

    return path.join(pathToApp, relativeUserPath);
};