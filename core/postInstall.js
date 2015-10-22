'use strict';

var path = require('path');
var fs = require('fs-extra');
var link = require('./lib/createLink');
var isNodeModule = require('./lib/isNodeModule');

var currentDir = process.env.PWD || __dirname;
var pathToApp = currentDir.replace(/^\w:\\/, function (match) {
    return match.toLowerCase();
});

var userPath = path.join(pathToApp, '../../');

var internalUserPath = path.join(pathToApp, 'user');

// check if sourcejs is installed as a node_package
if (isNodeModule(pathToApp)) {
    fs.removeSync(internalUserPath);
    link(userPath, internalUserPath, 'dir');
    console.log('SourceJS User folder symlink created.');
}