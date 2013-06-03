/*
* Source engine http://sourcejs.com
* @copyright 2013 Source, http://sourcejs.com
* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
* */

requirejs.config({
    paths: {
        core: '/core/js',
        modules: '/core/js/modules',
        lib: '/core/js/lib',
        templates: '/core/templates',
        plugins: '/plugins',
        user: '/user'
    }
});

require([
    "jquery",
    "core/options", // TODO: remove when all modules inherit Module()
    "modules/moduleLoader"
    ],
    function ($, options) {

    });
