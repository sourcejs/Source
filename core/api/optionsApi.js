'use strict';

var path = require('path');
var configUtils = require(path.join(global.pathToApp,'core/lib/configUtils'));
var loadOptions = require(path.join(global.pathToApp,'core/loadOptions'));

global.app.use('/api/options', function(req, res){
    var contextOpts = loadOptions();
    var ref = req.headers.referer || '';

    if (ref) {
        contextOpts = configUtils.getContextOptions(ref, contextOpts);
    }

    var assetsOptions = contextOpts.assets;

    // TODO: https://github.com/sourcejs/Source/issues/142
    assetsOptions.plugins = contextOpts.plugins;
    assetsOptions.info = contextOpts.info;

    res.jsonp(assetsOptions);
});