/*
 *
 * Assets options
 *
 * */

var options = require('../../options.js').assets;

define([
    'jquery',
    'sourceModules/inlineOptions'
    ], function($, inlineOptions) {

    // Default + User options merged built. Built from Grunt.
    var sourceOptions = options;

    // Override with from page inline options
    $.extend(true, options, inlineOptions);

    return sourceOptions;
});