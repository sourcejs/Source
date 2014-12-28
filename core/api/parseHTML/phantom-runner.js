/*
 *
 * This script is executed in separate process from main app and runs in PhantomJS context
 *
 * */

'use strict';

/* global phantom: true */
var page = require('webpage').create();
var system = require('system');

// arguments from node query
var url = system.args[1];
var port = system.args[2];

page.onResourceReceived = function(response) {
    if (response.id === 1 && response.status === 404 || response.status === 500) {
        console.log(JSON.stringify({
                "error": "Network error status "+ response.status,
                "url": url
            })
        );
        phantom.exit();
    }
};

page.onConsoleMessage = function(msg) {
    //console.log('-- webkit console: ' + msg);
};

page.open('http://127.0.0.1:' + port + '/' + url, function (status) {
    if (status !== 'success') {
        console.log(JSON.stringify({
                "error": "Error loading page.",
                "url": url
            })
        );

        phantom.exit();
    }

    setTimeout(function () {
        console.log(JSON.stringify([{
                "error": "Too long execution time.",
                "url": url
            }])
        );
        phantom.exit();
    }, 5000);
});

page.onCallback = function (data) {
    if (data.message) {
        var code = page.evaluate(function (url) {
            var output = {};

            $.ajax({
                url: '/source/assets/js/modules/sectionsParser.js',
                dataType: "script",
                async: false,
                success: function(){
                    var parser = new SourceGetSections();

                    output = parser.getSpecFull();
                }
            });

            return output;
        }, url);

        // TODO: make reponse in {{ ... }} to parse only relevant part
        // Returns stdout, that is then parsed from main app
        console.log(JSON.stringify(code));
        phantom.exit();

    } else {
        console.log("No callback received", JSON.stringify({
                "url": url
            })
        );
        phantom.exit();
    }
};

page.onError = function(msg, trace) {
    var log = {
        "error": "Error onpage",
        "message": msg,
        "file": trace[0],
        "line": trace[0].line,
        "function": trace[0].function
    };

    console.log('Phantom-runner error: ', JSON.stringify(log, null, 4));
};