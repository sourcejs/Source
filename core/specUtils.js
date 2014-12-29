'use strict';

var path = require('path');
var fs = require('fs-extra');

//TODO: add JSdoc

module.exports.parseSpecPath = function(urlPath){
    var output = {};
    var splitExt = urlPath.split('.');
    var hasExt = splitExt.length > 1;

    if (hasExt) {
        output.ext = splitExt[1];
        output.pathToSpec = path.dirname(urlPath);
    } else {
        output.pathToSpec = urlPath;
    }

    return output;
};

// TODO: add other extensions support
module.exports.getSpecFile = function(pathToSpec, ext){
    var output = '';
    var allSpecsPath = global.app.get('user');
    var basePath = path.join(allSpecsPath, pathToSpec);
    var srcPath = path.join(basePath, 'index.src');
    var htmlPath = path.join(basePath, 'index.html');

    if (ext) {
        var knownExtPath = path.join(basePath, 'index.' + ext);

        try {
            output = fs.readFileSync(knownExtPath, 'utf-8');
        } catch (e) {
            output = false;
        }
    } else {
        try {
            output = fs.readFileSync(srcPath, 'utf-8');
        } catch (e) {
            try {
                output = fs.readFileSync(htmlPath, 'utf-8');
            } catch (e) {
                output = false;
            }
        }
    }

    return output;
};

module.exports.getSpecInfo = function(pathToSpec) {
    var output = {};
    var allSpecsPath = global.app.get('user');

    try {
        if (pathToSpec.split('/')[1] === 'docs'){
            output = fs.readJSONFileSync(path.join(global.pathToApp, pathToSpec, 'info.json'));
        } else {
            output = fs.readJSONFileSync(path.join(allSpecsPath, pathToSpec, 'info.json'));
        }
    } catch (e) {
        output = {
            title: 'No info file found'
        };
    }

    return output;
};