var fs = require('fs');
var extend = require('extend');
var deepExtend = require('deep-extend');
var path = require('path');
var globalOpts = global.opts.core;
var pathToApp = path.dirname(require.main.filename);

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
    outputFile: path.join(pathToApp,'core/api/data/pages_tree.json'),
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
            dirContent.push(includedDir)
        });
    }

    dirContent.forEach(function (pathToFile) {
        // Path is excluded
        if (excludes.test(dir)) {
            return
        }

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

            // If starts with root
            if (urlFromHostRoot.lastIndexOf(config.sourceRoot, 0) === 0) {
                // Clean of from path
                var urlForJson = urlFromHostRoot.replace(config.sourceRoot, '');
            } else {
                // Making path absolute
                var urlForJson = '/' + urlFromHostRoot;
            }

            //Removing filename from path
            urlForJson = urlForJson.split('/');
            urlForJson.pop();
            urlForJson = urlForJson.join('/');

            page.url = urlForJson || '';
            page.lastmod = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('.') || '';
            page.lastmodSec = Date.parse(fileStats.mtime) || '';
            page.fileName = targetFile || '';
            page.thumbnail = false;

            if (fs.existsSync(dir + '/' + config.infoFile)) {
                var fileJSON = JSON.parse(fs.readFileSync(dir + '/' + config.infoFile, "utf8"));

                deepExtend(page, fileJSON);
            }

            if (fs.existsSync(dir + '/thumbnail.png')) {
                page.thumbnail = true;
            }

            outputJSON['specFile'] = extend(page);
        }
    });

    return outputJSON;
};


// function for write json file
var GlobalWrite = function (callback) {
    var outputFile = config.outputFile;
    var outputPath = path.dirname(outputFile);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath)
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
};

// Run function on server start
GlobalWrite(function(){
    require(path.join(pathToApp, 'core/api/htmlParser'));
});

// Running GlobalWrite by cron
if (config.cron || (global.MODE === 'production' && config.cronProd)) {
    setInterval(function () {
        GlobalWrite();
    }, config.cronRepeatTime);
}

// run task from server homepage
module.exports.scan = function () {
    // flag for waiting script end and only then can be run again
    if (flagNotExec) {
        flagNotExec = false;
        setTimeout(function () {
            GlobalWrite();
        }, 5000);
    }
};
