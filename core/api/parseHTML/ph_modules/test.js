'use strict';

/**
 * Тестирование функций для фантома
 */

var page = require('webpage').create();
var system = require('system');
var phantom = require('phantomjs');

//page.addCookie({
//    "name": "source-mode",
//    "value": "development",
//    "path": "/",
//    "expires": 1000*60*60
//});

page.open('http://me:8080/' + system.args[1], function (result) {
    if (result !== 'success') {
        console.log('Cannot load page.');
        phantom.exit();
    }
    else {
        console.log('http://me:8080/' + system.args[1]);

        var code = page.evaluate(function () {
            var title = document.title;
            if (title === '404') {
                return JSON.stringify({message: "Page not found"});
            }

            return document.title;
        });

        console.log('Page eval: ', code);

    }

});

page.onCallback = function (data) {
    console.log(JSON.stringify(data));
    phantom.exit();
};

page.onConsoleMessage = function(msg) {
    console.log('-- page console: ', msg);
};

page.onResourceReceived = function(response) {
    if (response.id === 1 && response.status === 404 || response.status === 500) {
        console.log('Loading error: ', response.status);
    }
};