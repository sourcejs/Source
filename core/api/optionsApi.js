'use strict';

var path = require('path');
var configUtils = require(path.join(global.pathToApp,'core/lib/configUtils'));
var loadOptions = require(path.join(global.pathToApp,'core/loadOptions'));

global.app.use('/api/options', function(req, res){
    var contextOptions = loadOptions();
    var ref = req.headers.referer || '';

    if (ref) {
        contextOptions = configUtils.getContextOptions(ref, contextOptions);
    }

    // Legacy options root structure
    var assetsOptions = contextOptions.assets;

    // TODO: https://github.com/sourcejs/sourcejs/issues/142
    assetsOptions.plugins = contextOptions.plugins;
    assetsOptions.rendering = contextOptions.rendering;
    assetsOptions.specInfo = contextOptions.specInfo;

    res.jsonp(assetsOptions);
});
