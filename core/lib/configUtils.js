'use strict';

var fs = require('fs-extra');
var path = require('path');
var finder = require('fs-finder');
var nodeUtils = require('util');
var url = require('url');
var utils = require(path.join(global.pathToApp, 'core/lib/utils'));
var pathResolver = require(path.join(global.pathToApp, 'core/lib/pathResolver'));
var specUtils = require(path.join(global.pathToApp, 'core/lib/specUtils'));

var coreOptionsInContextWarnOnce = [];

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
 * Search up the tree for context options paths
 *
 * @param {String} startPath - path to dir from where to start searching
 *
 * @returns {Array} Returns list of paths with found options files
 */
var getContextOptionsList = module.exports.getContextOptionsList = function(startPath) {
    var checkPath = fs.existsSync(startPath);
    if (!checkPath) return [];

    var searchStopPath = global.userPath;
    var fileToFind = path.sep + global.opts.core.common.contextOptionsFile;

    // Skip if start path is behind stop path
    if ((new RegExp(/^..\//)).test(path.relative(searchStopPath, startPath).replace(/\\/g, '/'))) return [];

    return finder.in(startPath).lookUp(searchStopPath).findFiles(fileToFind);
};

/**
 * Process options view path
 *
 * @param {Object} options - options object to process
 * @param {String} [context] - path to context folder for resolving $(context)
 *
 * @returns {Object} Returns processed options object or undefined
 */
var processOptionsViewPaths = module.exports.processOptionsViewPaths = function(options, context) {
    if (!options) return;

    var updateArr = function(optItem){
        return optItem.map(function (item) {
            return pathResolver.resolve(item, context);
        });
    };

    for (var opt in options.rendering.views) {
        if (options.rendering.views.hasOwnProperty(opt)) {
            var optItem = options.rendering.views[opt];

            if (nodeUtils.isArray(optItem)) {
                options.rendering.views[opt] = updateArr(optItem);
            }
        }
    }

    return options;
};

/**
 * Process options object
 *
 * @param {String} optionsPath - path to options file
 * @param {Object} [optionsObj] - options file content
 *
 * @returns {Object} Returns processed options object
 */
var processOptions = module.exports.processOptions = function(optionsPath, optionsObj) {
    var optionsDir = path.dirname(optionsPath);
    var options = optionsObj || utils.requireUncached(optionsPath);

    if (options.rendering && options.rendering.views) processOptionsViewPaths(options, optionsDir);

    return options;
};

var extendContextOptions = module.exports.extendContextOptions = function(defaultOptions, newOptionsPath, newOptionsObj) {
    var output = defaultOptions || {};

    var contextOptionsItem = processOptions(newOptionsPath, newOptionsObj);

    if (contextOptionsItem.core && coreOptionsInContextWarnOnce.indexOf(newOptionsPath) === -1) {
        global.log.warn('Core options could not be overridden from context options, check ' + newOptionsPath);

        coreOptionsInContextWarnOnce.push(newOptionsPath);
    }

    // Override default options with context options items
    if (output.assets) utils.extendOptions(output.assets, contextOptionsItem.assets);
    if (output.rendering) utils.extendOptions(output.rendering, contextOptionsItem.rendering);
    if (output.plugins) utils.extendOptions(output.plugins, contextOptionsItem.plugins);

    return output;
};

/**
 * Get merged options object, with merged context level options
 *
 * @param {String} startPath - path from where to start searching for context options (ends at user path)
 * @param {Object} [defaultOptions] - SourceJS options object (global.opts)
 *
 * @returns {Object} Returns a merged options object
 */
var getMergedOptions = module.exports.getMergedOptions = function(startPath, defaultOptions) {
    var _defaultOptions = defaultOptions || {};
    var output = utils.extendOptions({}, _defaultOptions);
    var optionsArr = getContextOptionsList(startPath);

    // Normalize  windows paths
    optionsArr = optionsArr.map(function(item){
        return item.replace(/\\/g, '/');
    });

    optionsArr = optionsArr.sort(function (a, b) {
        var al = a.split('/').length;
        var bl = b.split('/').length;

        if (al > bl) return 1;
        if (al < bl) return -1;

        return 0;
    });

    optionsArr.forEach(function(newOptionsPath){
        extendContextOptions(output, newOptionsPath);
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
    var contextOptionsEnabled = global.opts.core.common.contextOptions;

    var parsedRefUrl = url.parse(refUrl);
    var refUrlPath = parsedRefUrl.pathname;
    var specDir = specUtils.getFullPathToSpec(refUrlPath);

    var contextOptions = contextOptionsEnabled ? getMergedOptions(specDir, _defaultOpts) : _defaultOpts;

    var infoFilePath = path.join(specDir, global.opts.core.common.infoFile);
    var infoOptionsKey = global.opts.core.common.infoFileOptions;

    // Extent context options object with info.json contents
    contextOptions.specInfo = fs.existsSync(infoFilePath) ? fs.readJsonSync(infoFilePath, {throws: false}) : undefined;

    // Override local options
    if (contextOptionsEnabled && contextOptions.specInfo && contextOptions.specInfo[infoOptionsKey]) {
        extendContextOptions(contextOptions, infoFilePath, contextOptions.specInfo[infoOptionsKey]);
    }

    return contextOptions;
};
