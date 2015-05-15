'use strict';

var path = require('path');
var fs = require('fs-extra');
var pathToApp = path.dirname(require.main.filename);

var parseData = require(path.join(global.pathToApp, 'core/lib/parseData'));
var specsDataPath = path.join(pathToApp, global.opts.core.api.specsData);
var parseSpecData = new parseData({
    scope: 'specs',
    path: specsDataPath
});


/**
 * Parse clean path to spec from URL
 *
 * @param {String} urlPath - raw url ("/base/spec/index.src"
 *
 * @returns {Object} output
 * @returns {String} output.ext - file extension, if exists
 * @returns {String} output.pathToSpec - path to Spec
 */
module.exports.parseSpecUrlPath = function(urlPath){
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
    // TODO: improve parsing to many cases

    return urlToSpec.slice(1, urlToSpec.length - 1);
};

/**
 * Get information about defined specSpec
 *
 * @param {String} pathToSpec - spec id ("base/btn") or url ("/base/btn/")
 *
 * @returns {Object} Return single info object of the spec
 */
module.exports.getSpecInfo = function(pathToSpec) {
    var specID = pathToSpec.charAt(0) === '/' ? getSpecIDFromUrl(pathToSpec) : pathToSpec;

    return parseSpecData.getByID(specID);
};

/**
 * Get Spec name from defined directory
 *
 * @param {String} dirPath - Spec directory
 *
 * @returns {String} Return Spec file path or undefined
 */
module.exports.getSpecFromDir = function(dirPath) {
    var dirContent = fs.readdirSync(dirPath);
    var supportedSpecNames = global.opts.core.common.specFiles;
    var specPath;

    for (var i=0; i < supportedSpecNames.length; i++) {
        var item = supportedSpecNames[i];

        if (dirContent.indexOf(item) > -1) {
            specPath = path.join(dirPath, item);
            break;
        }
    }

    return specPath;
};