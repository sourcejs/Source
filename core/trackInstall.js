'use strict';

var path = require('path');

var rootPath = __dirname.replace(/^\w:\\/, function (match) {
    return match.toLowerCase();
});
var enginePath = global.pathToApp = path.join(rootPath, '../');

var loadOptions = require('./loadOptions');
var options = global.opts = loadOptions(enginePath);

var trackStats = require(path.join(global.pathToApp, 'core/trackStats'));

if (process.env.CI) {
    options.core.tracking.enabled = false;
}

if (options && options.core && options.core.tracking && options.core.tracking.enabled) {
    trackStats.event({
        group: 'install',
        event: 'default'
    });

    console.log('[SOURCEJS] Note: engine tracks anonymous usage statistics. To disable it, edit `core.tracking` configuration.');
} else {
    trackStats.event({
        group: 'install',
        event: 'disabled tracking'
    }, true);
}
