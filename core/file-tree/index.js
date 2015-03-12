'use strict';

var fs = require('fs-extra');
var extend = require('extend');
var deepExtend = require('deep-extend');
var path = require('path');
var extendTillSpec = require(path.join(global.pathToApp,'core/lib/extendTillSpec'));
var unflatten = require(path.join(global.pathToApp,'core/unflat'));
var specUtils = require(path.join(global.pathToApp,'core/lib/specUtils'));
var globalOpts = global.opts.core;
var busy = false;

var config = {
    // Add directory name for exclude, write path from root ( Example: ['core','docs/base'] )
    includedDirs: ['docs'],
    excludedDirs: ['data', 'plugins', 'node_modules', '.git', '.idea'],
    cron: false,
    cronProd: true,
    cronRepeatTime: 60000,
    outputFile: path.join(global.pathToApp, 'core/api/data/pages-tree.json'),
    specsRoot: path.join(global.pathToApp, globalOpts.common.pathToUser).replace(/\\/g, '/'),
    busyTimeout: 300,

    // Files from parser get info
    infoFile: "info.json"
};
// Overwriting base options
deepExtend(config, global.opts.core.fileTree);

var normalizedPathToApp = global.pathToApp.replace(/\\/g, '/');

var prepareExcludesRegex = function(){
    var dirsForRegExp = '';
    var i = 1;
    config.excludedDirs.forEach(function (exlDir) {
        if (i < config.excludedDirs.length) {
            dirsForRegExp = dirsForRegExp + "^" + config.specsRoot + "\/" + exlDir + "|";
        } else {
            dirsForRegExp = dirsForRegExp + "^" + config.specsRoot + "\/" + exlDir;
        }
        i++;
    });
    return new RegExp(dirsForRegExp);
};

var getSpecMeta = module.exports.getSpecMeta = function(specPath){
    var page = {};
    var _specPath = specPath;

    if (specPath && fs.existsSync(specPath)) {
        _specPath = _specPath.replace(/\\/g, '/');
    } else {
        return page;
    }

    var fileStats = fs.statSync(_specPath);
    var targetFile = path.basename(_specPath);
    var dirName = path.dirname(_specPath);
    var d = new Date(fileStats.mtime);

    var urlForJson;

    // If starts with root (specs)
    if (_specPath.lastIndexOf(config.specsRoot, 0) === 0) {
        // Cleaning path to specs root folder
        urlForJson = _specPath.replace(config.specsRoot, '');
    } else {
        // Cleaning path for included folders
        urlForJson = _specPath.replace(normalizedPathToApp, '');
    }

    //Removing filename from path
    urlForJson = urlForJson.split('/');
    urlForJson.pop();
    urlForJson = urlForJson.join('/');

    page.id = urlForJson.substring(1);
    page.url = urlForJson || '';
    page.lastmod = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('.') || '';
    page.lastmodSec = Date.parse(fileStats.mtime) || '';
    page.fileName = targetFile || '';
    page.thumbnail = false;

    var thumbPath = path.join(dirName, 'thumbnail.png').replace(/\\/g, '/');
    if (fs.existsSync(thumbPath)) {
        // If starts with root (specs)
        if (_specPath.lastIndexOf(config.specsRoot, 0) === 0) {
            page.thumbnail = thumbPath.replace(config.specsRoot + '/','');
        } else {
            page.thumbnail = thumbPath.replace(normalizedPathToApp  + '/','');
        }
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
            // Going deeper
            var childObj = fileTree(pathToFile);
            if (Object.getOwnPropertyNames(childObj).length !== 0) {
                outputJSON[targetFile] = extend(outputJSON[targetFile], childObj);
            }

        } else if (targetFile.toLowerCase() === config.infoFile.toLowerCase()) {
            var specPath = specUtils.getSpecFromDir(processingDir);
            var pageMeta = getSpecMeta(specPath);

            var infoJsonPath = processingDir + '/' + config.infoFile;

            if (fs.existsSync(infoJsonPath)) {
                var fileJSON;
                try {
                    fileJSON = JSON.parse(fs.readFileSync(infoJsonPath, "utf8"));
                } catch (e) {
                    console.error("Error reading info.json: " + infoJsonPath);

                    fileJSON = {
                        error: "Cannot parse the file",
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
            console.log('Error writing file tree: ', err);
            callback(err);
            return;
        }

        global.log.trace("Pages tree JSON saved to " + outputFile);

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
        var prevData = {};
        var dataStoragePath = global.opts.core.api.specsData;
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

        busy = true;

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

            busy = true;
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
        callback = typeof callback === 'function' ? callback : function () {};

        writeDataFile(fileTree(config.specsRoot), function(){
            callback();

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