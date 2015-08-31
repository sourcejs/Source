'use strict';

var path = require('path');

var rootPath = __dirname.replace(/^\w:\\/, function (match) {
    return match.toLowerCase();
});
var enginePath = global.pathToApp = path.join(rootPath, '../');

var loadOptions = require('./loadOptions');
var options = global.opts = loadOptions(enginePath);

var trackStats = require(path.join(global.pathToApp, 'core/trackStats'));

if (options && options.core.common && options.core.common.trackAnonymusStatistics) {
    trackStats.staticEvent('install', 'default');

    console.log('\n[SOURCEJS] Note: engine tracks anonymous usage statistics. To disable it, edit `core.common.trackAnonymusStatistics` configuration.\n');
} else {
    trackStats.staticEvent('install', 'no stats', true);
}