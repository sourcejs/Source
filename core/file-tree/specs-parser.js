var fs = require('fs-extra');
var deepExtend = require('deep-extend');
var path = require('path');
var shell = require('shelljs');
var TasksQueue = require(path.join(__dirname, 'tasks-queue'));

module.exports = (function() {
    'use strict';

    var config = {};

    var prepareExcludesRegex = function() {
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

    var parseSpecsData = function(root, done) {
        config.specFileRegEx = new RegExp(config.specFileRegExPattern);
        root = root[root.length-1] !== '/' ? root + '/' : root;
        var app = config.pathToApp[config.pathToApp.length-1] !== '/' ? config.pathToApp + '/' : config.pathToApp
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
                            files.push(path.join(config.pathToApp, includedDir));
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

    return {
        'init': function(_config) {
            config = _config;
        },
        'parse': parseSpecsData
    };

})();