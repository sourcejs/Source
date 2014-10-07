'use strict';

var fs = require('fs-extra');
var extend = require('extend');
var deepExtend = require('deep-extend');
var path = require('path');
var parseHTML = require(path.join(global.pathToApp, 'core/api/parseHTML'));

var globalOpts = global.opts.core;

var flagNotExec = true;
var config = {
    // Add directory name for exclude, write path from root ( Example: ['core','docs/base'] )
    includedDirs: ['docs'],
    excludedDirs: ['data', 'plugins', 'node_modules', '.git', '.idea'],

    // File masks for search
    fileMask: ['index.html', 'index.src'],
    cron: false,
    cronProd: true,
    cronRepeatTime: 60000,
    outputFile: path.join(global.pathToApp,'core/api/data/pages_tree.json'),
    sourceRoot: globalOpts.common.pathToUser,

    // Files from parser get info
    infoFile: "info.json"
};
// Overwriting base options
deepExtend(config, global.opts.core.fileTree);

var prepareExcludesRexex = function(){
    var dirsForRegExp = '';
    var i = 1;
    config.excludedDirs.forEach(function (exlDir) {
        if (i < config.excludedDirs.length) {
            dirsForRegExp = dirsForRegExp + "^" + config.sourceRoot + "\/" + exlDir + "|";
        } else {
            dirsForRegExp = dirsForRegExp + "^" + config.sourceRoot + "\/" + exlDir;
        }
        i++;
    });
    return new RegExp(dirsForRegExp);
};

var isSpec = function (file) {
    var response = false;

    config.fileMask.map(function (specFile) {
        if (file === specFile) {
            response = true;
        }
    });

    return response;
};

var fileTree = function (dir) {
    var outputJSON = {};
    var dirContent = fs.readdirSync(dir);
    var excludes = prepareExcludesRexex();

    // Adding paths to files in array
    for (var i = 0; dirContent.length > i; i++) {
        dirContent[i] = path.join(dir, dirContent[i]);
    }

    //on first call we add includedDirs
    if (dir === config.sourceRoot) {
        config.includedDirs.map(function (includedDir) {
            dirContent.push(includedDir);
        });
    }

    dirContent.forEach(function (pathToFile) {
        // Path is excluded
        if (excludes.test(dir)) {return;}

        var targetFile = path.basename(pathToFile);
        var urlToFile = pathToFile;
        var baseName = path.basename(dir);

        urlToFile = path.normalize(urlToFile).replace(/\\/g, '/');
        var urlFromHostRoot = urlToFile.replace('../', '/');

        outputJSON[baseName] = outputJSON[baseName];

        var fileStats = fs.statSync(urlToFile);

        var d = new Date(fileStats.mtime);

        if (fileStats.isDirectory()) {

            var childObj = fileTree(urlToFile);
            if (Object.getOwnPropertyNames(childObj).length !== 0) {
                outputJSON[targetFile] = extend(outputJSON[targetFile], childObj);
            }

        } else if (isSpec(targetFile)) {
            var page = {};
            var urlForJson;

            // If starts with root
            if (urlFromHostRoot.lastIndexOf(config.sourceRoot, 0) === 0) {
                // Clean of from path
                urlForJson = urlFromHostRoot.replace(config.sourceRoot, '');
            } else {
                // Making path absolute
                urlForJson = '/' + urlFromHostRoot;
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

            if (fs.existsSync(dir + '/' + config.infoFile)) {
                var fileJSON = JSON.parse(fs.readFileSync(dir + '/' + config.infoFile, "utf8"));

                deepExtend(page, fileJSON);
            }
            var thmumbPath = dir + '/thumbnail.png';
            if (fs.existsSync(thmumbPath)) {
                page.thumbnail = thmumbPath.split('/').splice(1).join('/');
            }

            outputJSON['specFile'] = extend(page);
        }
    });

    return outputJSON;
};


// function for write json file
var writeDataFile = function (callback) {
    if (flagNotExec) {
        var outputFile = config.outputFile;
        var outputPath = path.dirname(outputFile);

        flagNotExec = false;

        // Preparing path for data write
        try {
            fs.mkdirpSync(outputPath);
        } catch (e) {
            if (e.code !== 'EEXIST') {
                global.log.warn("Could not set up data directory for Pages Tree, error: ", e);

                if (typeof callback === 'function') callback(e);
            }
        }

        fs.writeFile(outputFile, JSON.stringify(fileTree(config.sourceRoot), null, 4), function (err) {
            if (err) {
                console.log('Error writing file tree: ', err);
            } else {
                console.log("Pages tree JSON saved to " + outputFile);
                flagNotExec = true;
            }

            if (typeof callback === 'function') callback(err);
        });
    }
};

// Run function on server start
writeDataFile(function(){
    if (global.opts.core.parseHTML.onStart) parseHTML.processSpecs();
});

// Running writeDataFile by cron
if (config.cron || (global.MODE === 'production' && config.cronProd)) {
    setInterval(function () {
        writeDataFile();
    }, config.cronRepeatTime);
}

// run task from server homepage
module.exports.scan = function () {
    // flag for waiting script end and only then can be run again
    writeDataFile();
};
