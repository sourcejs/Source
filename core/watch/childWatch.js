// Runs as a child process through forever-monitor

'use strict';

var path = require('path');
var watch = require('gulp-watch');
var _ = require('lodash');
var commander = require('commander');

// Parse arguments
commander
    .option('-r, --root [string]', 'Root path of the SourceJS app', '../../')
    .option('-l, --log [string]', 'Log level', 'info')
    .parse(process.argv);

global.commander = global.commander || commander;

// Normalized path to master app
global.pathToApp = global.pathToApp || path.join(__dirname, commander.root).replace(/\\/g, '/').replace(/\/$/, '');

var loadOptions = require(path.join(global.pathToApp, 'core/loadOptions'));
global.opts = global.opts || loadOptions(path.resolve(global.pathToApp), true);

var logger = require(path.join(global.pathToApp, 'core/logger'));
var log = logger.log;
global.log = log;

var userPath = global.userPath = (require(path.join(global.pathToApp, 'core/lib/getUserPath')))();

var utils = require(path.join(global.pathToApp, 'core/lib/utils'));
var fileTree = require(path.join(global.pathToApp, 'core/file-tree'));

var config = {
    enabled: true,
    verbose: false,
    glob: [
        '!' + global.pathToApp + '/**/.*/**',
        '!' + userPath + '/**/.*/**',
        '!' + userPath + '/**/bower_components/**',
        '!' + userPath + '/**/node_modules/**',

        global.pathToApp + '/docs/**/' + global.opts.core.common.infoFile,
        global.pathToApp + '/test/**/' + global.opts.core.common.infoFile,
        userPath + '/**/' + global.opts.core.common.infoFile
    ],
    ignoreHiddenFiles: true
};
// Overwriting base options
utils.extendOptions(config, global.opts.core.watch);

var prepareData = function(data, targetFile){
    var dir = path.dirname(targetFile);

    return _.merge(fileTree.getSpecMeta(dir), data);
};

if (config.enabled){
    if (!global.opts.core.watch.foreverWatchEnabled) {
        global.log.debug('Specs watcher process started.');
    }

    watch(config.glob, {
        verbose: config.verbose
    }, function(vinyl){
        var filePath = vinyl.path.replace(/\\/g, '/');
        var event = vinyl.event;
        var cleanPath = filePath.replace(userPath, '').replace(global.pathToApp + '/', '');
        var specID = path.dirname(cleanPath);
        var rawContents;

        global.log.debug('event', event);
        global.log.debug('changed file', filePath);

        try {
            rawContents = JSON.parse(String(vinyl.contents));
        } catch(e) {}

        // TODO: run full re-index on huge changes (like git update)

        if (rawContents && (event === 'change' || event === 'add')) {
            var dataToSend = {};
            dataToSend[specID + '/specFile'] = prepareData(rawContents, filePath);

            fileTree.updateFileTree(dataToSend, true);
        }

        if (typeof rawContents === 'undefined' || event === 'unlink') {
            fileTree.deleteFromFileTree(specID);
        }
    });
}