'use strict';

var path = require('path');
var fs = require('fs-extra');
var ParseData = require(path.join(global.pathToApp, 'core/lib/parseData'));


/**
 * Parse clean path to spec from URL
 *
 * @param {String} urlPath - raw url ("/base/spec/index.src.html")
 *
 * @returns {Object} output
 * @returns {String} output.ext - file extension, if exists
 * @returns {String} output.pathToSpec - path to Spec
 */
var parseSpecUrlPath = module.exports.parseSpecUrlPath = function(urlPath){
    // TODO: add any type of url parsing, including parameters

    var output = {};
    var splitExt = urlPath.split('.');
    var hasExt = splitExt.length > 1;

    if (hasExt) {
        output.ext = splitExt[1];
        output.pathToSpec = path.dirname(urlPath);
    } else {
        output.pathToSpec = urlPath;
    }

    return output;
};

/**
 * Parse spec ID from URL
 *
 * @param {String} urlToSpec - spec path or url ("/base/btn/")
 *
 * @returns {String} Return a parsed Spec ID
 */
var getSpecIDFromUrl = module.exports.getSpecIDFromUrl = function(urlToSpec){
    if (urlToSpec === '/') {
        return urlToSpec;
    } else {
        return urlToSpec.replace(/^\//, '').replace(/\/+$/, '');
    }
};

/**
 * Get information about defined specSpec
 *
 * @param {String} urlSpecPath - spec path from url
 *
 * @returns {Object} Return single info object of the spec
 */
module.exports.getSpecInfo = function(urlSpecPath) {
    var specsDataPath = path.join(global.pathToApp, global.opts.core.api.specsData);
    var parseSpecData = new ParseData({
        scope: 'specs',
        path: specsDataPath
    });

    var specID = getSpecIDFromUrl(urlSpecPath);

    return parseSpecData.getByID(specID);
};

/**
 * Get Spec name from defined directory
 *
 * @param {String} dirPath - Spec directory
 * @param {Array} [specFiles] - list of spec files to check
 *
 * @returns {String} Return first found Spec file path or undefined
 */
module.exports.getSpecFromDir = function(dirPath, specFiles) {
    var dirContent = fs.existsSync(dirPath) ? fs.readdirSync(dirPath) : undefined;

    if (!dirContent) return;

    var supportedSpecNames = specFiles || global.opts.rendering.specFiles;
    var specPath;

    for (var i=0; i < supportedSpecNames.length; i++) {
        var item = supportedSpecNames[i];

        // Support folders inside names, e.g. 'docs/index.html'
        if (item.indexOf('/') !== -1) {
            var filename = path.join(dirPath, item);
            if (fs.existsSync(filename)) {
                specPath = filename;
                break;
            }
        } else {
            if (dirContent.indexOf(item) > -1) {
                specPath = path.join(dirPath, item);
                break;
            }
        }
    }

    return specPath;
};

/**
 * Get absolute path to Spec dir
 *
 * @param {String} urlPath - relative URL (web) to spec
 *
 * @returns {String} Return absolute path to Spec dir
 */
module.exports.getFullPathToSpec = function(urlPath){
    var pathToSpec = parseSpecUrlPath(urlPath).pathToSpec;
    var cleanPath = urlPath.replace(/\/+$/, '').replace(/\//, '');
    var specPath = path.join(global.userPath, pathToSpec);

    // Including non-standard paths, outside default static route
    global.opts.core.common.includedDirs.forEach(function(item){
        if (cleanPath.split('/')[0] === item) {
            specPath = specPath.replace(global.userPath, global.pathToApp);
        }
    });

    // remove trailing slash
    return path.normalize(specPath).replace(/\/+$/, '');
};
