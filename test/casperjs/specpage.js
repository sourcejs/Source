var appPort = casper.cli.get('app-port') || 8080;
var url = 'http://127.0.0.1:' + appPort + '/docs/spec/';

casper.options.viewportSize = {width: 1024, height: 768};

casper.test.begin('Checking inner navigation', 3, function suite(test) {
	casper.start(url).then(function() {
        var _this = this;
        var menu = '.source_nav.__loaded';

        this.waitForSelector(menu,
            function pass() {
                this.click('.source_nav .source_main_nav_li:nth-child(2) a');

                test.assertEquals(this.getCurrentUrl(), url+'#2', 'URL with hash is right')
            },
            function fail() {
                test.fail(menu);
            }
        );

    }).then(function() {
        var highlighted = '.source_nav .source_main_nav_li:nth-child(2).__active a.__active';

        this.waitForSelector(highlighted,
            function pass() {
                test.assertEval(function () {
                    return window.pageYOffset > 1000 && window.pageYOffset < 2500;
                }, 'Page should be scrolled to section');

                test.assertExists(highlighted, 'Menu item highlighted');
            },
            function fail() {
                test.fail(highlighted);
            }
        );

	}).run(function() { test.done() }).clear();
});

casper.test.begin('Code source', 2, function suite(test) {
	casper.start(url).then(function() {
        var _this = this;
        var actionItem = '.source_main_nav_ac_item.source_source-code_action-item';

        this.waitForSelector(actionItem,
            function pass() {
                this.click(actionItem + ' .source_slider_frame');
                test.assertExists(actionItem + ' .source_slider_frame.source_slider_frame__on', 'Toggler is highlighted');
            },
            function fail() {
                test.fail(actionItem);
            }
        );

    }).then(function() {
        var codeSource = '.source_source-code.source_source-code__show';

        this.waitForSelector(codeSource,
            function pass() {
                test.assertExists(codeSource, 'Code source is shown');
            },
            function fail() {
                test.fail(codeSource);
            }
        );

	}).run(function() { test.done() }).clear();
});

casper.test.begin('Hash link openning', 2, function suite(test) {
	casper.start(url + '#2').then(function() {
        var highlighted = '.source_nav .source_main_nav_li:nth-child(2).__active a.__active';

        this.waitForSelector(highlighted,
            function pass() {
                test.assertEval(function () {
                    return window.pageYOffset > 1000 && window.pageYOffset < 2500;
                }, 'Page should be scrolled to section');

                test.assertExists(highlighted, 'Menu item highlighted');
            },
            function fail() {
                test.fail(highlighted);
            }
        );
    }).run(function() { test.done() }).clear();
});