'use strict';

var fs = require('fs');
var deepExtend = require('deep-extend');
var path = require('path');
var configUtils = require('./lib/configUtils');
var utils = require('./lib/utils');

module.exports = function(basePath){
    var pathToApp = basePath || path.dirname(require.main.filename);

    var coreSettings = utils.requireUncached(path.join(pathToApp,'options'));
    var pathToUser = path.join(pathToApp, coreSettings.core.common.pathToUser);

    // Using specific path to specs parsing, because we don't have global.opts yet
    var userSettingsFile = path.join(pathToUser, 'options.js');
    var userLocalSettingsFile = path.join(pathToUser, 'local-options.js');

    // Adding assets npm plugin list to options
    deepExtend(coreSettings, configUtils.prepareClientNpmPlugins(pathToUser));

    // If user settings file is present, override core settings
    if(fs.existsSync(userSettingsFile)) {
        deepExtend(coreSettings, utils.requireUncached(userSettingsFile));
    }

    // If local settings file is present, override core settings
    if(fs.existsSync(userLocalSettingsFile)) {
        deepExtend(coreSettings, utils.requireUncached(userLocalSettingsFile));
    }

    return coreSettings;
};