'use strict';

var deepExtend = require('deep-extend');
var path = require('path');
var fileTree = require(path.join(global.pathToApp, 'core/file-tree'));
var watch = require('gulp-watch');
var specUtils = require(path.join(global.pathToApp,'core/lib/specUtils'));

var config = {
    enabled: true,
    ignoreHiddenFiles: true
};
// Overwriting base options
deepExtend(config, global.opts.core.watch);

var normalizedPathToApp = global.pathToApp.replace(/\\/g, '/');

var prepareData = function(data, targetFile){
    var dir = path.dirname(targetFile);
    var specPath = specUtils.getSpecFromDir(dir);

    return deepExtend(fileTree.getSpecMeta(specPath), data);
};

watch(global.pathToApp + '/**/info.json', function(vinyl){
    var filePath = vinyl.path.replace(/\\/g, '/');
    var event = vinyl.event;
    var cleanPath = filePath.replace(normalizedPathToApp + '/', '').replace(global.opts.core.common.pathToUser +'/', '');
    var specID = path.dirname(cleanPath);
    var rawContents;

    global.log.debug('file change', filePath);

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