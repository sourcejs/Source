var fs = require('fs'),
    extend = require('extend'),
    path = require('path');

    // sourceMaster root path
    var sourceRoot = global.opts.common.pathToSpecs,
        rootLength = global.opts.common.pathToSpecs.length;

// add directory name for exclude, write path from root ( Example: ['core','docs/base'] )
var excludedDirs = global.opts.fileTree.excludedDirs;

// files from parser get info
// TODO: move info.json to options globally
var infoFile = "info.json";

// path to output file to write parsed data in json format
// TODO: move output file name to options globally also for client code
var outputFile = 'data/pages_tree.json';

// File mask for search
var fileMask = global.opts.fileTree.fileMask; //Arr

// for waiting when function finished
var NOT_EXEC = true;

// configuration for function timeout
// !!! on localhost recommend false on server true
var cron = global.opts.fileTree.cron;
var cronRepeatTime = global.opts.fileTree.cronRepeatTime;

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

function fileTree(dir) {
    var outputJSON = {},
        dirContent = fs.readdirSync(dir);

    dirContent.forEach(function(file) {
        var targetFile = file;

        if (excludes.test(dir)) {return}

        var urlToFile = dir + '/' + targetFile,
            baseName = path.basename(dir);

        urlToFile = path.normalize(urlToFile);
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

            var urlForJson = urlFromHostRoot.substring(rootLength, urlFromHostRoot.length);

            //Removing filename from path
            urlForJson = urlForJson.split('/');
            urlForJson.pop();
            urlForJson = urlForJson.join('/');

            var page = {};

            if (fs.existsSync(dir+'/'+infoFile)) {
                    var fileJSON = require("../../"+dir+"/"+infoFile);

                var lastmod = [d.getDate(), d.getMonth()+1, d.getFullYear()].join('.'),
                    lastmodSec = Date.parse(fileStats.mtime),
                    fileName = targetFile,
                    author = fileJSON.author,
                    title = fileJSON.title,
                    keywords = fileJSON.keywords,
                    info = fileJSON.info;
            } else {
                // if infoFile don't exist in project folder
                var lastmod = [d.getDate(), d.getMonth()+1, d.getFullYear()].join('.'),
                    lastmodSec = Date.parse(fileStats.mtime),
                    fileName = targetFile
            }

            page = {
                url: urlForJson,
                lastmod: lastmod,
                fileName: fileName,
                lastmodSec: lastmodSec,
                author: author,
                title: title,
                keywords: keywords,
                info: info
            };

            outputJSON['specFile'] = extend(page);
        }
    });
    return outputJSON;
}

// function for write json file
var GlobalWrite = function() {
    fs.writeFile(global.app.get("specs path") + "/" + outputFile, JSON.stringify(fileTree(sourceRoot), null, 4), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Pages tree JSON saved to " + global.opts.common.pathToSpecs+"/"+outputFile);
            NOT_EXEC=true;
        }
    });
};
// run function on server start
GlobalWrite();

// setcron fot 1 minute (60000ms)
if (cron) {
    setInterval(function(){
        GlobalWrite();
    }, cronRepeatTime);
}

// run task from server homepage
module.exports.scan = function () {
    // NOT_EXEC for waiting script end and only then can be run again
    if (NOT_EXEC) {
        NOT_EXEC = false;
        setTimeout(function(){
            GlobalWrite();
        },5000);
    }
};