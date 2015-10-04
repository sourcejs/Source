'use strict';

var path = require('path');
var link = require('./lib/createLink');

var pathToApp = __dirname.replace(/^\w:\\/, function (match) {
    return match.toLowerCase();
});

var enginePath = path.join(pathToApp, '../');
var userPath = path.join(enginePath, '../../');
var internalUserPath = path.join(enginePath, 'user');
var parentNodeModules = path.join(enginePath, '../');

// check if sourcejs is installed as a node_package
if (
    path.relative(parentNodeModules, enginePath) === 'sourcejs'
) {
    link(userPath, internalUserPath, 'dir');
    console.log('SourceJS User folder symlink created.');
}