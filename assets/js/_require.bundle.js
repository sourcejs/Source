(function() {
    'use strict';

    var app = (function() {
        "{%= grunt.file.read('assets/js/lib/require.js') %}"
        return {
            'require': require,
            'define': define,
            'requirejs': requirejs
        };
    })();

    app.version = "{%= '\"' + grunt.config.get('pkg.version') + '\"' %}";

    app.requirejs.config({
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
            'node_modules': '/node_modules',
            'sourceLib/jquery.mb.browser': "lib/jquery/jquery-bundle",
            'sourceLib/codeFormat': "lib/jquery/jquery-bundle",
            'sourceLib/jquery.couch': "lib/jquery/jquery-bundle"
        },
        'map': {
            '*': {
                // for * modules we use jquery-noconflict instead of jquery
                'jquery': "lib/jquery/jquery-noconflict"
            },
            // for jquery-noconflict module we use real jquery
            'lib/jquery/jquery-noconflict': {'jquery': "lib/jquery/jquery"},
            'lib/jquery/jquery-plugins-bundle': {'jquery': "lib/jquery/jquery"}
        }
    });
    
    // creating root namespace
    window["{%= '\"' + grunt.config.get('options.assets.namespace') + '\"' %}"] = app;
})();