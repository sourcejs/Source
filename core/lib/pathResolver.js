'use strict';

var path = require('path');
var fs = require('fs');
var util = require('util');

/**
 * Replace stubs in path ($(sourcejs), $(user), $(context) etc)
 *
 * @param {String} pathToResolve - path to modify
 * @param {String} [relativePath] - relative path
 *
 * @returns {String} Return resolved path
 */
var resolve = module.exports.resolve = function(pathToResolve, relativePath){
    if (!pathToResolve) return;

    var map = {
        sourcejs: global.pathToApp,
        user: global.app.get('user'),
        context: relativePath || global.app.get('user')
    };
    var result = pathToResolve;

    global.log.trace('Resolve path', result);

    for (var tag in map) {
        if (map.hasOwnProperty(tag)) {
            var tagVal = map[tag];
            var prepareRegExpString = '$('+tag+')';
            prepareRegExpString = prepareRegExpString.replace(/[$-\/?[-^{|}]/g, '\\$&');
            var re = new RegExp(prepareRegExpString, 'g');

            result = result.replace(re, tagVal);
        }
    }

    global.log.trace('Resolve path returned', result);

    return result;
};

/**
 * Check file or path existence following the array of options
 *
 * @param {Array} pathsArr - array of paths to check
 * @param {String} [filePath] - file path to append for each option
 *
 * @returns {String} Return first existing path or undefined
 */
module.exports.checkExistence = function(pathsArr, filePath){
    if (!pathsArr && !util.isArray(pathsArr)) return;

    var fullPath;

    global.log.trace('Check existence', pathsArr, filePath);

    for(var i=0; i < pathsArr.length; i++) {
        var checkPath = filePath ? path.join(pathsArr[i], filePath) : pathsArr[i];
        checkPath = resolve(checkPath);

        if (fs.existsSync(checkPath)) {
            fullPath = checkPath;
            break;
        }
    }

    global.log.trace('Check existence returned', fullPath);

    return fullPath;
};