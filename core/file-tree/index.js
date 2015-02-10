'use strict';

var fs = require('fs-extra');
var deepExtend = require('deep-extend');
var path = require('path');
var parseHTML = require(path.join(global.pathToApp, 'core/api/parseHTML'));
var shell = require('shelljs');

var globalOpts = global.opts.core;
var flagNotExec = true;
var config = {
    // Add directory name for exclude, write path from root ( Example: ['core','docs/base'] )
    includedDirs: ['docs'],
    excludedDirs: ['data', 'plugins', 'node_modules', '.git', '.idea'],
    cron: false,
    cronProd: true,
    cronRepeatTime: 60000,
    outputFile: path.join(global.pathToApp, 'core/api/data/pages-tree.json'),
    specsRoot: path.join(global.pathToApp, globalOpts.common.pathToUser).replace(/\\/g, '/'),
    getFilesDateFromGit: true,
    // Files from parser get info
    infoFile: "info.json",
    specFileRegEx: /index\.(html|src)/,
    thumbnailFileName: "thumbnail.png",
    gitCommandBase: 'git -C ' + global.opts.core.common.pathToUser + ' log -1 --format="%ad" -- '
};
// Overwriting base options
deepExtend(config, global.opts.core.fileTree);

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

        collectSpecsData(config.specsRoot, function(specsData) {
            fs.writeFile(outputFile, JSON.stringify(specsData, null, 4), function (err) {
                if (err) {
                    console.log('Error writing file tree: ', err);
                } else {
                    console.log("Pages tree JSON saved to " + outputFile);
                    flagNotExec = true;
                }

                if (typeof callback === 'function') callback(err);
            });
        });
    }
};

var TasksQueue = function(options) {
    this.threadsNumber = options && options.threads ? options.threads : 1;
    this.threadQueues = [];
    this.ptr = 0;
    for (var i = 0; i < this.threadsNumber; i++) {
        this.threadQueues.push([]);
    }
};

TasksQueue.prototype.push = function(task) {
    this.threadQueues[this.getQueueNumber()].push(task);
};

TasksQueue.prototype.getQueueNumber = function() {
    this.ptr++;
    if (this.ptr >= this.threadsNumber) {
        this.ptr = 0;
    }
    return this.ptr;
};

TasksQueue.processTasksSync = function(tasks, callback) {
    if (!tasks || !tasks.length) {
        callback && callback();
        return;
    }
    tasks.shift()(function() {
        TasksQueue.processTasksSync(tasks, callback);
    });
};

TasksQueue.prototype.execute = function(callback) {
    var self = this;
    var remaining = this.threadQueues.length;
    this.threadQueues.forEach(function(queue) {
        TasksQueue.processTasksSync(queue, function() {
            if (!--remaining) {
                callback && callback();
            }
        });
    });
};

var tasks = new TasksQueue({
    'threads': 16
});

/**
 * @function fillInSpecDataObject - method to fill in spec data.
 * It create basic fields and initializes async action to fill last
 * modification date from git log or nodeJS fs.stat data.
 *
 * @param {Object} accumulator - empty spec data object to fill
 * @param {Object} meta - additional information, whitch is needed to create spec data
 * @param {String} meta.basename - spec file name
 * @param {String} meta.dirname - spec directory name
 * @param {String} meta.root - normalized specs root path
 * @param {String} meta.app - normalized app root path
 * @param {Object} meta.fileStat - nodeJS fs.stat method result 
 */
var fillInSpecDataObject = function(accumulator, meta) {
    var specDataObject = accumulator['specFile'] = accumulator['specFile'] || {};
    var dirname = meta.dirname;
    var info = {};

    try {
        info = JSON.parse(fs.readFileSync(dirname + '/' + config.infoFile));
    } catch(e) {
        info = {
            'error': "Cannot parse the file",
            'path': dirname + '/' + config.infoFile
        };
    };

    Object.keys(info).forEach(function(key) {
        specDataObject[key] = info[key];
    });

    specDataObject['id'] = dirname.replace(meta.root, '').replace(meta.app, '');
    specDataObject['url'] = '/' + specDataObject['id'];
    specDataObject['fileName'] = meta.basename;

    var thumbPath = path.join(dirname, config.thumbnailFileName);
    //TODO: false should be replaced by undefined or empty string
    specDataObject['thumbnail'] = fs.existsSync(thumbPath) ? thumbPath.replace(meta.root, '') : false;
    if (config.getFilesDateFromGit) {
        tasks.push(function(next) {
            shell.exec(config.gitCommandBase + dirname, {silent:true}, function(err, out) {
                var date = new Date(out ? out : meta.fileStat.mtime);
                specDataObject['lastmod'] = [date.getDate(), date.getMonth() + 1, date.getFullYear()].join('.') || '';
                specDataObject['lastmodSec'] = date.getTime();            
                next();
            });
        });
    } else {
        var date = new Date(meta.fileStat.mtime);
        specDataObject['lastmod'] = [date.getDate(), date.getMonth() + 1, date.getFullYear()].join('.') || '';
        specDataObject['lastmodSec'] = date.getTime();
    }
};

var processActionsSync = function(callback) {
    if (!actions || !actions.length) {
        callback && callback();
        return;
    }
    actions.shift()(function() {
        processActionsSync(callback);
    });
};

var collectSpecsData = function(root, done) {
    root = root[root.length-1] !== '/' ? root + '/' : root;
    var app = global.pathToApp[global.pathToApp.length-1] !== '/' ? global.pathToApp + '/' : global.pathToApp
    var specsData = {};
    var rootContent = fs.readdirSync(root);
    var excludes = prepareExcludesRegex();
    var rootFlag = false;
    var debug = false;

    var walkSpecsTreeRecursive = function(specPath, accumulator) {
        if (excludes.test(specPath)) return;
        var basename = path.basename(specPath);
        var dirname = path.dirname(specPath);
        var stat = fs.statSync(specPath);
        if (stat.isDirectory()) {
            rootFlag = root === specPath;
            
            fs.readdir(specPath, function(err, files) {
                if (rootFlag) {
                    config.includedDirs.map(function (includedDir) {
                        files.push(path.join(global.pathToApp, includedDir));
                    });
                    rootFlag = false;
                }
                accumulator[basename] = {};
                if (files && files.length) {
                    files.forEach(function(item) {
                        walkSpecsTreeRecursive(item[0] === '/' ? item : path.join(specPath, item), accumulator[basename]);
                    });
                } else {
                    tasks.execute(function() {
                        done(specsData[path.basename(root)]);
                    });
                }
            });
        } else if (config.specFileRegEx.test(basename) && root !== dirname + '/') {
            fillInSpecDataObject(accumulator, {
                'basename': basename,
                'dirname': dirname,
                'root': root,
                'app': app,
                'fileStat': stat
            });
        }
    };
    walkSpecsTreeRecursive(root, specsData);
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