'use strict';

module.exports = function(basePath){
    var path = require('path');
    var pathToApp = basePath || path.dirname(require.main.filename);
    var deepExtend = require('deep-extend');
    var fs = require('fs');
    var requireUncached = function (module) {
        delete require.cache[require.resolve(module)];
        return require(module);
    };
    var coreSettings = requireUncached(path.join(pathToApp,'options'));
    var pathToUser = path.join(pathToApp, coreSettings.core.common.pathToUser);

    // Using specific path to specs parsing, because we don't have global.opts yet
    // TODO: check case when path to user folder is redefined
    var userSettingsFile = path.join(pathToUser, 'options.js');
    var userLocalSettingsFile = path.join(pathToUser, 'local-options.js');

    var prepareClientNpmPlugins = function() {
        var pathToModules = path.join(pathToUser, 'node_modules');
        var clientNpmPlugins = {};
        clientNpmPlugins.assets = {};
        clientNpmPlugins.assets.npmPluginsEnabled = {};

        if (fs.existsSync(pathToModules)) {
            var allModules = fs.readdirSync(pathToModules);
            allModules.map(function (module) {
                // Check if module has right namespace AND assets/index.js file
                if (module.lastIndexOf('sourcejs-', 0) === 0 && fs.existsSync(path.join(pathToModules, module, 'assets/index.js'))) {
                    clientNpmPlugins.assets.npmPluginsEnabled[module] = true;
                }
            });
        }

        return clientNpmPlugins;
    };

    // Adding assets npm plugin list to options
    deepExtend(coreSettings, prepareClientNpmPlugins());

    // If user settings file is present, override core settings
    if(fs.existsSync(userSettingsFile)) {
        deepExtend(coreSettings, requireUncached(userSettingsFile));
    }

    // If local settings file is present, override core settings
    if(fs.existsSync(userLocalSettingsFile)) {
        deepExtend(coreSettings, requireUncached(userLocalSettingsFile));
    }

    return coreSettings;
};