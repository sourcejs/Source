'use strict';

var fs = require('fs');
var deepExtend = require('deep-extend');
var path = require('path');
var configUtils = require('./lib/configUtils');
var utils = require('./lib/utils');
var colors = require('colors');

var silent;

var legacyOptionsWarn = function(path, oldStruct, newStruct){
    var msg = 'You are using old options structure in ' + path.bold + ', please change ' + oldStruct.red + ' to ' + newStruct.green + '. Old options support will be deprecated in next major release.';

    if (global.log) {
        global.log.warn(msg);
    } else {
        global.logQueue = global.logQueue || [];

        global.logQueue.push({
            level: 'warn',
            msg: msg
        });
    }
};

var legacyOptionsChecker = function(options, optionsPath){
    if (options.core && options.core.common && options.core.common.specFiles) {
        options.rendering = options.rendering || {};

        if (!silent) legacyOptionsWarn(optionsPath, 'options.core.common.specFiles', 'options.rendering.specFiles');

        options.rendering.views = options.rendering.specFiles || options.core.common.specFiles;
    }

    return options;
};

var getOptions = function(path){
    return legacyOptionsChecker(utils.requireUncached(path), path);
};

module.exports = function(basePath, _silent){
    silent = _silent;

    var pathToApp = basePath || path.dirname(require.main.filename);

    var coreSettings = getOptions(path.join(pathToApp, 'options'));
    var pathToUser = path.join(pathToApp, coreSettings.core.common.pathToUser);

    // Using specific path to specs parsing, because we don't have global.opts yet
    var userSettingsFile = path.join(pathToUser, 'options.js');
    var userLocalSettingsFile = path.join(pathToUser, 'local-options.js');

    // Adding assets npm plugin list to options
    deepExtend(coreSettings, configUtils.prepareClientNpmPlugins(pathToUser));

    // If user settings file is present, override core settings
    if(fs.existsSync(userSettingsFile)) {
        deepExtend(coreSettings, getOptions(userSettingsFile));
    }

    // If local settings file is present, override core settings
    if(fs.existsSync(userLocalSettingsFile)) {
        deepExtend(coreSettings, getOptions(userLocalSettingsFile));
    }

    return coreSettings;
};