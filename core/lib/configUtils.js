'use strict';

var fs = require('fs');
var deepExtend = require('deep-extend');
var path = require('path');
var finder = require('fs-finder');
var nodeUtils = require('util');
var utils = require(path.join(global.pathToApp, 'core/lib/utils'));
var pathResolver = require(path.join(global.pathToApp, 'core/lib/pathResolver'));

module.exports.prepareClientNpmPlugins = function(pathToUser) {
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

var getBundleOptionsList = module.exports.getBundleOptionsList = function(startPath, fileName) {
    return finder.in(startPath).lookUp(global.pathToApp).findFiles('/' + fileName);
};

var resolveViewsPaths = module.exports.resolveViewsPaths = function(options, context) {
    var updateArr = function(optItem){
        return optItem.map(function (item) {
            return pathResolver.resolve(item, context);
        });
    };

    for (var opt in options.core.common.views) {
        if (options.core.common.views.hasOwnProperty(opt)) {
            var optItem = options.core.common.views[opt];

            if (nodeUtils.isArray(optItem)) {
                options.core.common.views[opt] = updateArr(optItem);
            }
        }
    }
};

var processOptions = module.exports.processOptions = function(optionsPath) {
    var optionsDir = path.dirname(optionsPath);
    var options = utils.requireUncached(optionsPath);

    if (options.core && options.core.common && options.core.common.views) resolveViewsPaths(options, optionsDir);

    return options;
};

module.exports.getMergedOptions = function(startPath, fileName, defaultOptions) {
    var output = deepExtend({}, defaultOptions);
    var optionsArr = getBundleOptionsList(startPath, fileName);

    optionsArr = optionsArr.sort(function (a, b) {
        var al = a.split('/').length;
        var bl = b.split('/').length;

        if (al > bl) return 1;
        if (al < bl) return -1;

        return 0;
    });

    optionsArr.forEach(function(path){
       deepExtend(output, processOptions(path));
    });

    return output;
};