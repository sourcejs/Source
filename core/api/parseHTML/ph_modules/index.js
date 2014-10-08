'use strict';

/* global phantom: true */
var page = require('webpage').create();
var fs = require('fs');
var system = require('system');

//var parser = require('./parser').parser;
//var test = require('./test');

// arguments from node query
var url = system.args[1];
//var id = system.args[2];

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
//    console.log('-- webkit console: ' + msg);
};

page.open('http://127.0.0.1:8080/'+ url, function (status) {
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
            var output;

            $.ajax({
                url: '/source/assets/js/modules/sectionsParser.js',
                dataType: "script",
                async: false,
                success: function(){
                    var parser = new SourceGetSections(url);
                    output = parser.get();
                }
            });

            return output;
        }, url);

        // make reponse in {{ ... }} to parse only relevant part
        console.log(code);
        phantom.exit();

    } else {
        console.log(JSON.stringify({
                "error": "No callback recieved",
                "url": url
            })
        );
        phantom.exit();
    }
};

page.onError = function(msg, trace) {
//    console.log('--- error: '+ url +' ---\nph_modules/output.txt', 'Error: '+ msg + '\nFile: '+ trace[0].file +'\nLine: '+ trace[0].line +'\nFunc: '+ trace[0].function + '\n--- /error ---');

    var file = url.split('/').join('-');

    fs.write(__dirname + '/ph_modules/log/output_'+ file +'.txt', 'Error: '+ msg + '\nFile: '+ trace[0].file +'\nLine: '+ trace[0].line +'\nFunc: '+ trace[0].function);

//    console.log(JSON.stringify({
//        "error": "Error onpage",
//        "message": msg,
//        "file": trace[0],
//        "line": trace[0].line,
//        "function": trace[0].function
//    }));
};

// TODO: check list below
// [*] unify throw Error helper
// [*] ...

// from old Clarify:
// [done] beatify HTML output
// [done] create JSON with data from <HEAD>
// [done] parse several blocks in same page with one request
// [done] switchers to another specs from cleared one;
// [done] clear template - @param {GET} clr
// [done] phantomjs -> jsdom
// [..partial] client-side UI controls to clarify specs
// [...] support for other template engines
// * [] diffrernt links to phantomjs relative to OS
// * [] connect custom templates and scripts
// * [] avoid hardcoded paths
// * [] use css/js optionally by GET params
// * [] save user session settings
// * [] try POST instead GET
// * [] Ajax
// * [] link from already clarified code to original spec page
// * [] phantomjs error with try to get unavaliable script
// * [] screenshots by phatnomjs
// * [] phantomjs: not to close session (improve perfomance?);
// * [] buttons  to add custom libraries to clarified page (jQuery, require);
// * [in progress..] another context templates [mob, clr, ...]