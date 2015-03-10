'use strict';

var fs = require('fs-extra');
var deepExtend = require('deep-extend');
var path = require('path');
var childProcess = require("child_process");
var unflatten = require(path.join(global.pathToApp,'core/unflat'));
var extendTillSpec = require(path.join(global.pathToApp,'core/lib/extendTillSpec'));

/* jshint -W044: false */

var config = deepExtend({
    'pathToApp': global.pathToApp,
    // Add directory name for exclude, write path from root ( Example: ['core','docs/base'] )
    'includedDirs': ['docs'],
    'excludedDirs': ['data', 'plugins', 'node_modules', '.git', '.idea'],
    'cron': false,
    'cronProd': true,
    'cronRepeatTime': 60000,
    'outputFile': path.join(global.pathToApp, 'core/api/data/pages-tree.json'),
    'specsRoot': path.join(global.pathToApp, global.opts.core.common.pathToUser).replace(/\\/g, '/'),
    'getFilesDateFromGit': true,
    'infoFile': "info.json",
    'thumbnailFileName': "thumbnail.png",
    'specFileRegExPattern': "index\.(html|src|jade|haml)",
    'gitCommandBase': 'git -C ' + global.opts.core.common.pathToUser + ' log -1 --format="%ad" -- ',
    'busyTimeout': 300
}, global.opts.core.fileTree);

var isCollectingInProgress = false;
var isFirstLaunch = true;

// function for write json file
var writeDataFile = function (specsData, callback) {
    var outputFile = config.outputFile;

    fs.writeFile(outputFile, JSON.stringify(specsData, null, 4), function (err) {
        if (err) {
            global.log.error('Error writing file tree: ', err);
        } else if(isFirstLaunch) {
            isFirstLaunch = false;
            global.log.info("Pages tree JSON saved to " + outputFile);
        }
        callback && callback();
        isCollectingInProgress = false;
    });
};

var collector = childProcess.fork(path.join(__dirname, "/data-collector"));

var collectData = function() {
    if (isCollectingInProgress) {
        setTimeout(function() {
            collectData();
        }, config.busyTimeout);
        return;
    }
    isCollectingInProgress = true;
    collector.send({"config": config});
};

// function for update file tree json
var scan = module.exports.scan = function(callback) {
    collectData();
    collector.on('message', function(specs) {
        if (typeof specs === 'object') {
            writeDataFile(specs, function() {
                callback && callback();
            });
        }
    }.bind(global.app));
};

// function for updating file tree
var updateFileTree = module.exports.updateFileTree = function (data, unflattenData, callback) {
    if (isCollectingInProgress) {
        setTimeout(function() {
            updateFileTree(data, unflattenData, callback);
        }, config.busyTimeout);
        return;
    }
    var prevData = {};
    var dataStoragePath = global.opts.core.api.specsData;
    callback = typeof callback === 'function' ? callback : function() {};

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

    isCollectingInProgress = true;
    writeDataFile(dataToWrite, function() {
        callback();
        setTimeout(function() {
            isCollectingInProgress = false;
        }, config.busyTimeout);
    });
};


// function for deleting object from file tree
var deleteFromFileTree = module.exports.deleteFromFileTree = function (specID) {
    if (isCollectingInProgress) {
        setTimeout(function() {
            deleteFromFileTree(specID);
        }, config.busyTimeout);
        return;
    }
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
        isCollectingInProgress = true;
        writeDataFile(processedData, function () {
            global.log.trace('Deleted object from file tree: ', specID);
            setTimeout(function() {
                isCollectingInProgress = false;
            }, config.busyTimeout);
        });
    });
};

// Running writeDataFile by cron
if (config.cron || (global.MODE === 'production' && config.cronProd)) {
    setInterval(function () {
        scan();
    }, config.cronRepeatTime);
}