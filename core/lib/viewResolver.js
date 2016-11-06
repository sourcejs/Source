'use strict';

var path = require('path');
var pathResolver = require(path.join(global.pathToApp + '/core/lib/pathResolver.js'));

/**
 * Get information about defined specSpec
 *
 * @param {String} typeOrPath - define type of view (spec/navigation), relative path to default views dir or absolute path
 * @param {Object} viewsOptions - view options (global.opts.rendering.views)
 * @param {String} [context] - folder dir, to define $(context) resolver
 *
 * @returns {String} Return full path to view template of undefined
 */
module.exports = function(typeOrPath, viewsOptions, context){
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
            var assumedPathLocation = pathResolver.checkExistence(viewsOptions.defaultViewPaths, assumedPath, context);

            if (!!assumedPathLocation) {
                return assumedPathLocation;
            }
        } else if (viewsOptions[type] && viewsOptions[type].length > 0){
            return pathResolver.checkExistence(viewsOptions[type], null, context);
        }
    }

    return pathResolver.checkExistence([typeOrPath], null, context);
};
