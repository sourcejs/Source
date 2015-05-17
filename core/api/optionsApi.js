'use strict';

var url = require('url');
var path = require('path');
var configUtils = require(path.join(global.pathToApp,'core/lib/configUtils'));
var specUtils = require(path.join(global.pathToApp,'core/lib/specUtils'));
var loadOptions = require(path.join(global.pathToApp,'core/loadOptions'));

global.app.use('/api/options', function(req, res){
    var contextOpts = loadOptions();
    var ref = req.headers.referer || '';

    if (ref) {
        var parsedRefUrl = url.parse(ref);
        var refUrlPath = parsedRefUrl.pathname;

        var specDir = specUtils.getFullPathToSpec(refUrlPath);
        contextOpts = configUtils.getMergedOptions(specDir, contextOpts);
    }

    var assetsOptions = contextOpts.assets;

    // TODO: https://github.com/sourcejs/Source/issues/142
    assetsOptions.plugins = contextOpts.plugins;

    res.jsonp(assetsOptions);
});