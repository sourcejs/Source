'use strict';

var fs = require('fs');
var path = require('path');
var configUtils = require('./lib/configUtils');
var utils = require('./lib/utils');
var colors = require('colors'); // jshint ignore:line

var silent;

var legacyOptionsWarn = function(oldStruct, newStruct, fileName){
    var _fileName = fileName || 'options.js';

    // Shout warn message only once
    if (global.legacyOptionsWarnOnce && global.legacyOptionsWarnOnce.indexOf(oldStruct) > -1) return;

    var msg = 'You are using an old options structure in `' + _fileName + '` conf file, please change ' + oldStruct.red + ' to ' + newStruct.green + '. Old options support will be deprecated in next major release.';

    if (global.log) {
        global.log.warn(msg);
    } else {
        global.logQueue = global.logQueue || [];

        global.logQueue.push({
            level: 'warn',
            msg: msg
        });
    }

    global.legacyOptionsWarnOnce = global.legacyOptionsWarnOnce || [];
    global.legacyOptionsWarnOnce.push(oldStruct);
};

var legacyOptionsChecker = function(options, fileName){
    var haveCommon = options.core && options.core.common;

    // Server options
    options.core = options.core || {};
    options.core.server = options.core.server || {};
    if (haveCommon && options.core.common.port) {
        if (!silent) legacyOptionsWarn('options.core.common.port', 'options.core.server.port', fileName);

        options.core.server.port = options.core.server.port || options.core.common.port;

        // Update old conf path with new (for legacy support)
        options.core.common.port = options.core.server.port;
    }

    // Rendering options
    options.rendering = options.rendering || {};
    if (haveCommon && options.core.common.specFiles) {
        if (!silent) legacyOptionsWarn('options.core.common.specFiles', 'options.rendering.specFiles', fileName);

        options.rendering.specFiles = options.rendering.specFiles || options.core.common.specFiles;
    }

    // Add *.src.html if not defined
    if (
        options.rendering && options.rendering.specFiles &&
        options.rendering.specFiles.indexOf('index.src') > -1 &&
        options.rendering.specFiles.indexOf('index.src.html') === -1
    ) {
        for (var i=0; i < options.rendering.specFiles.length; i++) {
            var currentItem = options.rendering.specFiles[i];

            if (currentItem === 'index.src') {
                options.rendering.specFiles.splice(i + 1, 0, 'index.src.html');
                break;
            }
        }
    }

    return options;
};

module.exports = function(basePath, _silent){
    silent = _silent;

    var pathToApp = basePath || global.pathToApp;

    var mergedOptions = utils.requireUncached(path.join(pathToApp, 'options'));

    // Using specific path to specs parsing, because we don't have global.opts yet
    var pathToUser = (require('./lib/getUserPath'))(mergedOptions, pathToApp);
    var userSettingsFile = path.join(pathToUser, 'options.js');
    var userLocalSettingsFile = path.join(pathToUser, 'local-options.js');

    // Adding assets npm plugin list to options
    utils.extendOptions(mergedOptions, configUtils.prepareClientNpmPlugins(pathToUser));

    // If user settings file is present, override core settings
    if(fs.existsSync(userSettingsFile)) {
        utils.extendOptions(mergedOptions, legacyOptionsChecker(utils.requireUncached(userSettingsFile)), 'options.js');
    }

    // If local settings file is present, override core settings
    if(fs.existsSync(userLocalSettingsFile)) {
        utils.extendOptions(mergedOptions, legacyOptionsChecker(utils.requireUncached(userLocalSettingsFile)), 'local-options.js');
    }

    return mergedOptions;
};
