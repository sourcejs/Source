'use strict';

var fs = require('fs');
var deepExtend = require('deep-extend');
var path = require('path');
var configUtils = require('./lib/configUtils');
var utils = require('./lib/utils');
var colors = require('colors'); // jshint ignore:line

var silent;

var legacyOptionsWarn = function(path, oldStruct, newStruct){
    // Shout warn message only once
    if (global.legacyOptionsWarnOnce && global.legacyOptionsWarnOnce.indexOf(oldStruct) > -1) return;

    var msg = 'You are using old options structure in `' + path + '`, please change ' + oldStruct.red + ' to ' + newStruct.green + '. Old options support will be deprecated in next major release.';

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

var legacyOptionsChecker = function(options, optionsPath){
    if (options.core && options.core.common && options.core.common.specFiles) {
        options.rendering = options.rendering || {};

        if (!silent) legacyOptionsWarn(optionsPath, 'options.core.common.specFiles', 'options.rendering.specFiles');

        options.rendering.specFiles = options.rendering.specFiles || options.core.common.specFiles;
    }

    // Legacy options support, add *.src.html if not defined
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

    var pathToApp = basePath || path.dirname(require.main.filename);

    var mergedOptions = utils.requireUncached(path.join(pathToApp, 'options'));
    var pathToUser = path.join(pathToApp, mergedOptions.core.common.pathToUser);

    // Using specific path to specs parsing, because we don't have global.opts yet
    var userSettingsFile = path.join(pathToUser, 'options.js');
    var userLocalSettingsFile = path.join(pathToUser, 'local-options.js');

    // Adding assets npm plugin list to options
    deepExtend(mergedOptions, configUtils.prepareClientNpmPlugins(pathToUser));

    // If user settings file is present, override core settings
    if(fs.existsSync(userSettingsFile)) {
        deepExtend(mergedOptions, utils.requireUncached(userSettingsFile));
    }

    // If local settings file is present, override core settings
    if(fs.existsSync(userLocalSettingsFile)) {
        deepExtend(mergedOptions, utils.requireUncached(userLocalSettingsFile));
    }

    return legacyOptionsChecker(mergedOptions);
};