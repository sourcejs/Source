var coreSettings = require("./options.json"),
    deepExtend = require('deep-extend'),
    fs = require('fs');

var userSettings = {},
    userSettingsFile = "/../../user/options/options.json";

// if user settings file is present, override core settings
if(fs.existsSync(__dirname + userSettingsFile)) {
    userSettings = require(__dirname + userSettingsFile);
}

deepExtend(coreSettings, userSettings);

module.exports = coreSettings;