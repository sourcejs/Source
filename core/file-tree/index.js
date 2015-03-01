'use strict';

var fs = require('fs-extra');
var deepExtend = require('deep-extend');
var path = require('path');
var parseHTML = require(path.join(global.pathToApp, 'core/api/parseHTML'));
var childProcess = require("child_process");

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
    'gitCommandBase': 'git -C ' + global.opts.core.common.pathToUser + ' log -1 --format="%ad" -- '
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
        isCollectingInProgress = false;
        callback && callback();
    });
};

var collector = childProcess.fork(path.join(__dirname, "/data-collector"));

collector.on('message', function(specs) {
    if (typeof specs === 'object') {
        writeDataFile(specs, function() {
            if (global.opts.core.parseHTML.onStart) parseHTML.processSpecs();
        });
    }
}.bind(global.app));

var collectData = function() {
    if (isCollectingInProgress) return;
    isCollectingInProgress = true;
    collector.send({"config": config});
};

if (config.cron || (global.MODE === 'production' && config.cronProd)) {
    setInterval(function () {
        collectData();
    }, config.cronRepeatTime);
}

collectData();

module.exports.scan = function () {
    // flag for waiting script end and only then can be run again
    collectData();
};