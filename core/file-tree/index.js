'use strict';

var fs = require('fs-extra');
var extend = require('extend');
var deepExtend = require('deep-extend');
var path = require('path');
var extendTillSpec = require(path.join(global.pathToApp,'core/lib/extendTillSpec'));
var unflatten = require(path.join(global.pathToApp,'core/unflat'));
var specUtils = require(path.join(global.pathToApp,'core/lib/specUtils'));
var coreOpts = global.opts.core;
var prettyHrtime = require('pretty-hrtime');

var busy = false;

var config = {
    includedDirs: coreOpts.common.includedDirs,
    excludedDirs: ['node_modules', 'bower_components', '.git', '.idea'],

    // TODO: merge with `excludedDirs` in next major release.
    excludedDirsGlobal: ['node_modules', 'bower_components', '.git', '.idea'],
    cron: false,
    cronProd: true,
    cronRepeatTime: 60000,
    outputFile: path.join(global.pathToApp, 'core/api/data/pages-tree.json'),
    specsRoot: path.join(global.pathToApp, coreOpts.common.pathToUser).replace(/\\/g, '/'),
    busyTimeout: 300
};

// Overwriting base options
deepExtend(config, coreOpts.fileTree);

var infoFile = coreOpts.common.infoFile;
var normalizedPathToApp = global.pathToApp.replace(/\\/g, '/');

var prepareExcludesRegex = function(){
    var dirsForRegExp = '';
    var i = 1;
    config.excludedDirs.forEach(function (exlDir) {
        if (i < config.excludedDirs.length) {
            dirsForRegExp = dirsForRegExp + '^' + config.specsRoot + '\/' + exlDir + '|';
        } else {
            dirsForRegExp = dirsForRegExp + '^' + config.specsRoot + '\/' + exlDir;
        }
        i++;
    });
    return new RegExp(dirsForRegExp);
};


/**
 * Prepare relative path for web usage (like `/docs/spec`, `/specs/btn`) out of absolute path
 *
 * @param {String} path - absolute path to Spec directory or Spec file
 *
 * @returns {String} Return Spec file meta info (used in file-tree.json and in other places)
 */
var getRelativeSpecPath = module.exports.getRelativeSpecPath = function(absolutePath){
    var relativeSpecPath;

    if (absolutePath.lastIndexOf(config.specsRoot, 0) === 0) {
        // If starts with root (specs)

        // Cleaning path to specs root folder
        relativeSpecPath = absolutePath.replace(config.specsRoot, '');
    } else {
        // Cleaning path for included folders

        relativeSpecPath = absolutePath.replace(normalizedPathToApp, '');
    }

    return relativeSpecPath;
};


/**
 * Prepares Spec meta object from specs directory or Spec file path
 *
 * @param {String} specDirOrPath - path to Spec directory or Spec file
 *
 * @returns {Object} Return Spec file meta info (used in file-tree.json and in other places)
 */
var getSpecMeta = module.exports.getSpecMeta = function(specDirOrPath){
    var page = {};

    // Check if arg is provided and path exists
    if ( !(specDirOrPath && fs.existsSync(specDirOrPath))) return page;

    // Normalize windows URL and remove trailing slash
    var _specDirOrPath = specDirOrPath.replace(/\\/g, '/').replace(/\/$/, '');
    var isSpecPath = path.extname(_specDirOrPath) !== '';
    var specDir;
    var specPath;

    // Try to get specPath
    if (isSpecPath) {
        specDir = path.dirname(_specDirOrPath);
        specPath = _specDirOrPath;
    } else {
        specDir = _specDirOrPath;
        specPath = specUtils.getSpecFromDir(_specDirOrPath);
    }

    var relativeSpecPath = getRelativeSpecPath(_specDirOrPath);

    if (isSpecPath) {
        relativeSpecPath = path.dirname(relativeSpecPath);
    }

    // Remove first slash for ID
    page.id = relativeSpecPath.substring(1);
    page.url = relativeSpecPath;

    page.thumbnail = false;
    var thumbPath = path.join(specDir, 'thumbnail.png').replace(/\\/g, '/');
    if (fs.existsSync(thumbPath)) {
        // If starts with root (specs)
        if (specDir.lastIndexOf(config.specsRoot, 0) === 0) {
            page.thumbnail = thumbPath.replace(config.specsRoot + '/','');
        } else {
            page.thumbnail = thumbPath.replace(normalizedPathToApp  + '/','');
        }
    }

    // If we have Spec, get additional meta
    if (specPath) {
        var fileStats = fs.statSync(specPath);
        var targetFile = path.basename(specPath);
        var d = new Date(fileStats.mtime);

        page.lastmod = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('.') || '';
        page.lastmodSec = Date.parse(fileStats.mtime) || '';
        page.fileName = targetFile || '';
    }

    return page;
};

var fileTree = function (processingDir) {
    var outputJSON = {};
    var dirContent = fs.readdirSync(processingDir);
    var excludes = prepareExcludesRegex();

    // Adding paths to files in array
    for (var i = 0; dirContent.length > i; i++) {
        dirContent[i] = path.join(processingDir, dirContent[i].replace(/\\/g, '/'));
    }

    //on first call we add includedDirs
    if (processingDir === config.specsRoot) {
        config.includedDirs.map(function (includedDir) {
            dirContent.push(path.join(normalizedPathToApp, includedDir));
        });
    }

    dirContent.forEach(function(pathToFile) {
        // Path is excluded
        if (excludes.test(processingDir)) return;

        var targetFile = path.basename(pathToFile);

        // Normalizing path for windows
        pathToFile = path.normalize(pathToFile).replace(/\\/g, '/');

        var fileStats = fs.statSync(pathToFile);

        if (fileStats.isDirectory()) {
            if (config.excludedDirsGlobal.indexOf(targetFile) > -1) return;

            // Going deeper
            var childObj = fileTree(pathToFile);
            if (Object.getOwnPropertyNames(childObj).length !== 0) {
                outputJSON[targetFile] = extend(outputJSON[targetFile], childObj);
            }

        } else if (targetFile.toLowerCase() === infoFile.toLowerCase()) {
            var pageMeta = getSpecMeta(processingDir);

            var infoJsonPath = path.join(processingDir, infoFile);

            if (fs.existsSync(infoJsonPath)) {
                var fileJSON;
                try {
                    fileJSON = JSON.parse(fs.readFileSync(infoJsonPath, 'utf8'));
                } catch (e) {
                    global.console.warn('Error reading '+ infoFile +': ' + infoJsonPath);

                    fileJSON = {
                        error: 'Cannot parse the file',
                        path: infoJsonPath
                    };
                }

                deepExtend(pageMeta, fileJSON);
            }

            outputJSON['specFile'] = pageMeta;
        }
    });

    return outputJSON;
};

// function for write file tree json
var writeDataFile = function (data, callback) {
    var outputFile = config.outputFile;
    callback = typeof callback === 'function' ? callback : function(){};

    fs.outputFile(outputFile, JSON.stringify(data, null, 4), function (err) {
        if (err) {
            global.console.warn('Error writing file tree: ', err);
            callback(err);
            return;
        }

        global.log.trace('Pages tree JSON saved to ' + outputFile);

        callback();
    });
};

// function for updating file tree
var updateFileTree = module.exports.updateFileTree = function (data, unflattenData, callback) {
    if (busy) {
        setTimeout(function(){
            updateFileTree(data, unflattenData, callback);
        }, config.busyTimeout);
    } else {
        busy = true;

        var prevData = {};
        var dataStoragePath = path.join(global.pathToApp, coreOpts.api.specsData);
        callback = typeof callback === 'function' ? callback : function(){};

        if (unflattenData) {
            data = unflatten(data, { delimiter: '/', overwrite: 'root' });
        }

        try {
            prevData = fs.readJsonFileSync(dataStoragePath);
        } catch (e) {
            global.log.trace('Reading initial data error: ', e);
            global.log.debug('Extending from empty object, as we do not have initial data');
        }

        var dataToWrite = extendTillSpec(prevData, data);

        writeDataFile(dataToWrite, function(){
            callback();

            setTimeout(function(){
                busy = false;
            }, config.busyTimeout);
        });
    }
};

// function for deleting object from file tree
var deleteFromFileTree = module.exports.deleteFromFileTree = function (specID) {
    if (busy) {
        setTimeout(function(){
            deleteFromFileTree(specID);
        }, config.busyTimeout);
    } else {
        fs.readJSON(config.outputFile, function (err, data) {
            if (err) return;
            busy = true;

            var pathSplit = specID.split('/');

            var processPath = function (pathArr, obj) {
                var pathArrQueue = pathArr.slice(0); // Arr copy
                var currentItem = pathArrQueue.shift();

                if (currentItem !== '' && obj[currentItem]) {
                    if (pathArrQueue.length === 0) {
                        delete obj[currentItem];
                    }

                    if (pathArrQueue.length !== 0 && obj[currentItem].toString() === '[object Object]') {
                        obj[currentItem] = processPath(pathArrQueue, obj[currentItem]);
                    }
                }

                return obj;
            };

            var processedData = processPath(pathSplit, data);

            writeDataFile(processedData, function () {
                global.log.trace('Deleted object from file tree: ', specID);

                setTimeout(function(){
                    busy = false;
                }, config.busyTimeout);
            });
        });
    }
};

// function for update file tree json
var scan = module.exports.scan = function (callback) {
    if (busy) {
        setTimeout(function(){
            scan(callback);
        }, config.busyTimeout);
    } else {
        var start = process.hrtime();

        callback = typeof callback === 'function' ? callback : function () {};

        writeDataFile(fileTree(config.specsRoot), function(){
            callback();

            var end = process.hrtime(start);
            global.log.debug('Full file-tree scan took: ', prettyHrtime(end));

            setTimeout(function(){
                busy = false;
            }, config.busyTimeout);
        });
    }
};

// Running writeDataFile by cron
if (config.cron || (global.MODE === 'production' && config.cronProd)) {
    setInterval(function () {
        scan();
    }, config.cronRepeatTime);
}