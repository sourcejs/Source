/*
 *
 * Assets options
 *
 * */

sourcejs.amd.define([
    'jquery',
    'text!/api/options',
    'sourceModules/inlineOptions'
    ], function($, options, inlineOptions) {

    // Default + User options merged built. Built from Grunt.
    var sourceOptions = JSON.parse(options);

    // Override with from page inline options
    $.extend(true, sourceOptions, inlineOptions);

    return sourceOptions;
});
