var fs = require('fs'),
    extend = require('extend'),
    deepExtend = require('deep-extend'),
    path = require('path');

    // sourceMaster root path
    var sourceRoot = global.opts.common.pathToSpecs,
        rootLength = global.opts.common.pathToSpecs.length;

// add directory name for exclude, write path from root ( Example: ['core','docs/base'] )
var excludedDirs = global.opts.fileTree.excludedDirs;

// File mask for search
var fileMask = global.opts.fileTree.fileMask; //Arr

// files from parser get info
var INFO_FILE = "info.json";

// path to output file to write parsed data in json format
var OUTPUT_FILE = global.opts.fileTree.outputFile;

// for waiting when function finished
var NOT_EXEC = true;

// configuration for function timeout
var CRON = global.opts.fileTree.cron;
var CRON_REPEAT_TIME = global.opts.fileTree.cronRepeatTime;

// spec dependencies variables
var OUTPUT_SPEC_DEPENDENCIES_FILE = global.opts.specDependenciesTree.outputFile;
var includedDirs = global.opts.specDependenciesTree.includedDirs;

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
    var outputJSON = {},
        dirContent = fs.readdirSync(dir);

    dirContent.forEach(function(file) {
        var targetFile = file;

        if (excludes.test(dir)) {return}

        var urlToFile = dir + '/' + targetFile,
            baseName = path.basename(dir);

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

            var urlForJson = urlFromHostRoot.substring(rootLength, urlFromHostRoot.length);
            //Removing filename from path
            urlForJson = urlForJson.split('/');
            urlForJson.pop();
            urlForJson = urlForJson.join('/');

            page.url = urlForJson || '';
            page.lastmod = [d.getDate(), d.getMonth()+1, d.getFullYear()].join('.') || '';
            page.lastmodSec = Date.parse(fileStats.mtime) || '';
            page.fileName = targetFile  || '';

            if (fs.existsSync(dir+'/'+INFO_FILE)) {
                var fileJSON = JSON.parse(fs.readFileSync(dir+'/'+INFO_FILE, "utf8"));

                deepExtend(page, fileJSON);
            }

            outputJSON['specFile'] = extend(page);
        }
    });

    return outputJSON;
};

var specDependenciesTree = function(dir) {
    var outputJSON = {},
        specsDirs = {};

    includedDirs.forEach(function(includedDir) {
        specsDirs = fs.readdirSync(dir + '/' + includedDir);

        specsDirs.forEach(function(specDir) {
            var pathToInfo = dir + '/' + includedDir + '/' + specDir;

            if (fs.existsSync(pathToInfo + '/' + INFO_FILE)) {
                var fileJSON = JSON.parse(fs.readFileSync(pathToInfo + '/' + INFO_FILE, "utf8"));

                if (fileJSON['usedSpecs']) {
                    fileJSON['usedSpecs'].forEach(function(usedSpec){
                        outputJSON[usedSpec] = outputJSON[usedSpec] || [];
                        outputJSON[usedSpec].push(includedDir + '/' + specDir);
                    });
                }
            }
        });
    });

    return outputJSON;
};

// function for write json file
var GlobalWrite = function() {
    fs.writeFile(global.app.get("specs path") + "/" + OUTPUT_FILE, JSON.stringify(fileTree(sourceRoot), null, 4), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Pages tree JSON saved to " + global.opts.common.pathToSpecs+"/"+OUTPUT_FILE);
            NOT_EXEC=true;
        }
    });
    SpecDependenciesWrite();
};

var SpecDependenciesWrite = function() {
    fs.writeFile(global.app.get("specs path") + "/" + OUTPUT_SPEC_DEPENDENCIES_FILE, JSON.stringify(specDependenciesTree(sourceRoot), null, 4), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Spec dependencies JSON saved to " + global.opts.common.pathToSpecs+"/"+OUTPUT_SPEC_DEPENDENCIES_FILE);
        }
    });
};

// run function on server start
GlobalWrite();

// setcron
if (CRON && global.MODE === 'production') {
    setInterval(function(){
        GlobalWrite();
    }, CRON_REPEAT_TIME);
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
