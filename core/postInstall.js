'use strict';

var path = require('path');
var fs = require('fs-extra');
var link = require('./lib/createLink');

var currentDir = process.env.PWD || __dirname;
var pathToApp = currentDir.replace(/^\w:\\/, function (match) {
    return match.toLowerCase();
});

var userPath = path.join(pathToApp, '../../');

var internalUserPath = path.join(pathToApp, 'user');
var parentNodeModules = path.join(pathToApp, '../');

// check if sourcejs is installed as a node_package
if (path.relative(parentNodeModules, pathToApp) === 'sourcejs') {
    fs.removeSync(internalUserPath);
    link(userPath, internalUserPath, 'dir');
    console.log('SourceJS User folder symlink created.');
}