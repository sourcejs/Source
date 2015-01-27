(function() {
    'use strict';

    // TODO (Ilya Mikhailov 01.27.2015): replace hardcoded version value (package.json)
    window.SourceJS = (function() {
        "{%= grunt.file.read('assets/js/lib/require.js') %}"
        return {
            'require': require,
            'define': define,
            'requirejs': requirejs
        };
    })();

    window.SourceJS.version = "0.4.0";

    window.SourceJS.requirejs.config({
        // Create shorthands routes to clint-side npm plugins
        'packages': function () {
            var modulesList = "{%= npmPluginsEnabled %}";

            var npmPackages = [];
            for (var module in modulesList) {
                npmPackages.push({
                    name: module,
                    location: '/node_modules/' + module + '/assets',
                    main: 'index'
                })
            }

            return npmPackages;
        }(),
        'paths': {
            // /source/assets requests are routed to /assets
            'source': '/source/assets/js',
            'sourceModules': '/source/assets/js/modules',
            'sourceLib': '/source/assets/js/lib',
            'sourceTemplates': '/source/assets/templates',

            // Require.js plugins
            'text': '/source/assets/js/lib/text',

            // Relative to user root
            'js': '/assets/js',
            'plugins': '/plugins',
            'node_modules': '/node_modules'
        }
        // TODO (Ilya Mikhailov 01.27.2015): replace global jQuery by no-conflict script using this config
        /*,
        'map': {
            // for jquery-noconflict module we use real jquery
            'echo/third-party/jquery/jquery-noconflict': {'jquery': 'jquery'}
        }
        */
    });
})();

"{%= grunt.file.read('assets/js/lib/jquery-1.11.1.js') %}"