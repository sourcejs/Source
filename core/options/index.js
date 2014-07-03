var coreSettings = require('./options.json'),
    deepExtend = require('deep-extend'),
    path = require('path'),
    pathToApp = path.dirname(require.main.filename),
    fs = require('fs');

// Using specific path to specs parsing, because we don't have global.opts yet
var userSettingsFile = path.normalize(pathToApp + '/' + coreSettings.common.pathToUser + '/core/options/options.json'),
    localSettingsFile = path.normalize(pathToApp + '/' + coreSettings.common.pathToUser + '/core/options/local-options.json');

// If user settings file is present, override core settings
if(fs.existsSync(userSettingsFile)) {
    deepExtend(coreSettings, require(userSettingsFile));
}

// If local settings file is present, override core settings
if(fs.existsSync(localSettingsFile)) {
    deepExtend(coreSettings, require(localSettingsFile));
}

module.exports = coreSettings;