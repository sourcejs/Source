/*!
* SourceJS - Front-end documentation engine
* @copyright 2014 Sourcejs.com
* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
* */

requirejs.config({
    baseUrl: "/source/assets/js",

    paths: {
        // /source/assets requests are routed to /assets
        source: '/source/assets/js',
        sourceModules: '/source/assets/js/modules',
        sourceLib: '/source/assets/js/lib',
        sourceJam: '/source/assets/jam',
        sourceTemplates: '/source/assets/templates',

        js: "/assets/js",
        plugins: '/plugins',
        npmPlugins: '/node_modules'
    }
});

require([
    "jquery",
    "source/options", // TODO: remove when all modules inherit Module()
    "sourceModules/browser",
    "sourceModules/moduleLoader"
    ],
    function ($, options) {

    });
