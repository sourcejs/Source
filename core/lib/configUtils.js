'use strict';

var fs = require('fs-extra');
var deepExtend = require('deep-extend');
var path = require('path');
var finder = require('fs-finder');
var nodeUtils = require('util');
var url = require('url');
var utils = require(path.join(global.pathToApp, 'core/lib/utils'));
var pathResolver = require(path.join(global.pathToApp, 'core/lib/pathResolver'));
var specUtils = require(path.join(global.pathToApp, 'core/lib/specUtils'));

/**
 * Searches sourcejs-plugins in node_modules of specified folder
 *
 * @param {String} pathToUser - path to user folder, where to check node_modules
 *
 * @returns {Object} Returns configuration object with listed sourcejs-plugins
 */
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

/**
 * Search up the tree for bundle options paths
 *
 * @param {String} startPath - path to dir from where to start searching
 *
 * @returns {Array} Returns list of paths with found options files
 */
var getBundleOptionsList = module.exports.getBundleOptionsList = function(startPath) {
    var checkPath = fs.existsSync(startPath);

    if (!checkPath) return [];

    return finder.in(startPath).lookUp(global.app.get('user')).findFiles('/' + global.opts.core.common.bundleOptions);
};

/**
 * Process options view path
 *
 * @param {Object} options - options object to process
 * @param {String} [context] - path to context folder for resolving $(context)
 *
 * @returns {Object} Returns processed options object
 */
var processOptionsViewPaths = module.exports.processOptionsViewPaths = function(options, context) {
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

    return options;
};

/**
 * Process options object
 *
 * @param {String} optionsPath - path to options file
 *
 * @returns {Object} Returns processed options object
 */
var processOptions = module.exports.processOptions = function(optionsPath) {
    var optionsDir = path.dirname(optionsPath);
    var options = utils.requireUncached(optionsPath);

    if (options.core && options.core.common && options.core.common.views) processOptionsViewPaths(options, optionsDir);

    return options;
};

/**
 * Get merged options object, with merged bundle level options
 *
 * @param {String} startPath - path from where to start searching for bundle options (ends at user path)
 * @param {Object} [defaultOptions] - SourceJS options object (global.opts)
 *
 * @returns {Object} Returns a merged options object
 */
var getMergedOptions = module.exports.getMergedOptions = function(startPath, defaultOptions) {
    var _defaultOptions = defaultOptions || {};
    var output = deepExtend({}, _defaultOptions);
    var optionsArr = getBundleOptionsList(startPath);

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

/**
 * Get context options using ref URL
 *
 * @param {String} refUrl - referer URL
 * @param {Object} [defaultOpts] - default options object to merge in
 *
 * @returns {Object} Returns a context options object
 */
module.exports.getContextOptions = function(refUrl, defaultOpts) {
    var _defaultOpts = defaultOpts || global.opts;

    var parsedRefUrl = url.parse(refUrl);
    var refUrlPath = parsedRefUrl.pathname;
    var specDir = specUtils.getFullPathToSpec(refUrlPath);

    var contextOptions = global.opts.core.common.contextOptions ? getMergedOptions(specDir, _defaultOpts) : _defaultOpts;

    var infoFilePath = path.join(specDir, contextOptions.core.common.infoFile);
    var infoOptionsKey = contextOptions.core.common.infoFileOptions;

    contextOptions.info = fs.readJsonFileSync(infoFilePath, {throws: false});

    if (contextOptions.info && contextOptions.info[infoOptionsKey]) deepExtend(contextOptions, contextOptions.info[infoOptionsKey]);

    return contextOptions;
};