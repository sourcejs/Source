var coreSettings = require('./options.json'),
    deepExtend = require('deep-extend'),
    path = require('path'),
    pathToApp = path.dirname(require.main.filename),
    fs = require('fs');

var userSettingsFile = pathToApp + '/user/options/options.json',
    localSettingsFile = pathToApp + '/user/options/local-options.json';

// If user settings file is present, override core settings
if(fs.existsSync(userSettingsFile)) {
    deepExtend(coreSettings, require(userSettingsFile));
}

// If local settings file is present, override core settings
if(fs.existsSync(localSettingsFile)) {
    deepExtend(coreSettings, require(localSettingsFile));
}

module.exports = coreSettings;