'use strict';

var fs = require('fs');
var extend = require('extend');
var deepExtend = require('deep-extend');
var path = require('path');
var sourceRoot = global.opts.core.common.pathToUser;

// add directory name for exclude, write path from root ( Example: ['core','docs/base'] )
var excludedDirs = global.opts.core.fileTree.excludedDirs;
var includedDirs = global.opts.core.fileTree.includedDirs;

// File mask for search
var fileMask = global.opts.core.fileTree.fileMask; //Arr

// files from parser get info
var infoFile = "info.json";

// for waiting when function finished
var NOT_EXEC = true;

// configuration for function timeout
var CRON = global.opts.core.fileTree.cron;
var CRON_PROD = global.opts.core.fileTree.cronProd;
var CRON_REPEAT_TIME = global.opts.core.fileTree.cronRepeatTime;

// formatting RegExp for parser
var dirsForRegExp = '';
var i = 1;
excludedDirs.forEach(function(exlDir) {
    if (i<excludedDirs.length) {
        dirsForRegExp = dirsForRegExp+"^"+sourceRoot+"\/"+exlDir+"|";
    } else {
        dirsForRegExp = dirsForRegExp+"^"+sourceRoot+"\/"+exlDir;
    }
    i++;
});
var excludes = new RegExp(dirsForRegExp);

var isSpec = function(file) {
    var response = false;

    fileMask.map(function(specFile){
        if (file === specFile) {
            response = true;
        }
    });

    return response;
};


var fileTree = function(dir) {
    var outputJSON = {};
    var dirContent = fs.readdirSync(dir);

    // Adding paths to files in array
    for (var i=0; dirContent.length > i ;i++) {
        dirContent[i] = path.join(dir, dirContent[i]);
    }

    //on first call we add includedDirs
    if (dir === sourceRoot){
        includedDirs.map(function(includedDir){
            dirContent.push(includedDir);
        });
    }

    dirContent.forEach(function(pathToFile) {
        // Path is excluded
        if (excludes.test(dir)) {return;}

        var targetFile = path.basename(pathToFile);
        var urlToFile = pathToFile;
        var baseName = path.basename(dir);

        urlToFile = path.normalize(urlToFile).replace(/\\/g, '/');
        var urlFromHostRoot = urlToFile.replace('../','/');

        outputJSON[baseName] = outputJSON[baseName];

        var fileStats = fs.statSync(urlToFile);

        var d = new Date(fileStats.mtime);

        if (fileStats.isDirectory()) {

            var childObj = fileTree(urlToFile);
            if (Object.getOwnPropertyNames(childObj).length !== 0) {
                outputJSON[targetFile] = extend(outputJSON[targetFile],childObj);
            }

        } else if (isSpec(targetFile)) {
            var page = {};
            var urlForJson;
            // If starts with root
            if (urlFromHostRoot.lastIndexOf(sourceRoot, 0) === 0) {
                // Clean of from path
                urlForJson = urlFromHostRoot.replace(sourceRoot, '');
            } else {
                // Making path absolute
                urlForJson = '/' + urlFromHostRoot;
            }

            //Removing filename from path
            urlForJson = urlForJson.split('/');
            urlForJson.pop();
            urlForJson = urlForJson.join('/');

            page.url = urlForJson || '';
            page.lastmod = [d.getDate(), d.getMonth()+1, d.getFullYear()].join('.') || '';
            page.lastmodSec = Date.parse(fileStats.mtime) || '';
            page.fileName = targetFile  || '';
            page.thumbnail;

            if (fs.existsSync(dir+'/'+infoFile)) {
                var fileJSON = JSON.parse(fs.readFileSync(dir+'/'+infoFile, "utf8"));

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
var globalWrite = function() {
    var outputFile = global.app.get('user') + "/" + global.opts.core.fileTree.outputFile;
    var outputPath = path.dirname(outputFile);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }

    fs.writeFile(outputFile, JSON.stringify(fileTree(sourceRoot), null, 4), function (err) {
        if (err) {
            console.log('Error writing file tree: ', err);
        } else {
            console.log("Pages tree JSON saved to " + outputFile);
            NOT_EXEC=true;
        }
    });
};


// run function on server start
globalWrite();

// setcron
if (CRON || (global.MODE === 'production' && CRON_PROD)) {
    setInterval(function(){
        globalWrite();
    }, CRON_REPEAT_TIME);
}

// run task from server homepage
module.exports.scan = function () {
    // NOT_EXEC for waiting script end and only then can be run again
    if (NOT_EXEC) {
        NOT_EXEC = false;
        setTimeout(function(){
            globalWrite();
        },5000);
    }
};
