'use strict';

var path = require('path');
var pathResolver = require(path.join(global.pathToApp + '/core/lib/pathResolver.js'));

/**
 * Get information about defined specSpec
 *
 * @param {String} typeOrPath - define type of view (spec/navigation), relative path to default views dir or absolute path
 * @param {Object} viewsOptions - view options (global.opts.core.common.views)
 *
 * @returns {String} Return full path to view template of undefined
 */
module.exports = function(typeOrPath, viewsOptions){
    if (!typeOrPath) return;

    var type;

    // check pre-defined types
    if (viewsOptions) {
        for (var typeOption in viewsOptions) {
            if (typeOption === typeOrPath) {
                type = typeOrPath;
            }
        }

        // check short path definition
        if (!type) {
            var assumedPath = path.extname(typeOrPath) === '.ejs' ? typeOrPath : typeOrPath + '.ejs';
            var assumedPathLocation = pathResolver.checkExistence(viewsOptions.defaultViewPaths, assumedPath);

            if (!!assumedPathLocation) {
                return assumedPathLocation;
            }
        } else if (viewsOptions[type] && viewsOptions[type].length > 0){
            return pathResolver.resolve(pathResolver.checkExistence(viewsOptions[type]));
        }
    }

    return pathResolver.checkExistence([pathResolver.resolve(typeOrPath)]);
};