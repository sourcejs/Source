(function() {
    'use strict';
    // creating root namespace //{%= '\"' + grunt.config.get('options.assets.namespace') + '\"' %}
    window.SourceJS = SourceJS || {};

    //app.version = "{%= '\"' + grunt.config.get('pkg.version') + '\"' %}";

    requirejs.config({
        "waitSeconds": 5, // 5 sec before timeout exception
        "paths": {
            //'jquery': "lib/jquery/jquery",
            'lib/jquery/jquery-noconflict': "lib/jquery.bundle",
            'sourceModules': '/source/assets/js/modules',
            'source': '/source/assets/js',
            'sourceLib': '/source/assets/js/lib',
            'sourceTemplates': '/source/assets/templates',
            'text': 'loader'
        },
        "map": {
            // for jquery-noconflict module we use real jquery
            "lib/jquery/jquery-noconflict": {"jquery": "jquery"},
            "*": {
                // for * modules we use jquery-noconflict instead of jquery
                "jquery": "lib/jquery/jquery-noconflict"
            }
        }
        // Create shorthands routes to clint-side npm plugins
        /*'packages': function () {
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
        }()*/
    });
})();