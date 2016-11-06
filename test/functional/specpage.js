var appPort = casper.cli.get('app-port') || 8080;
var url = 'http://127.0.0.1:' + appPort + '/docs/test-specs/styles/';

casper.options.viewportSize = {width: 1024, height: 768};

casper.test.begin('Checking inner navigation', 8, function suite(test) {
    casper.start(url).then(function() {
        var _this = this;
        var menu = '.source_nav.__loaded';
        var section = '.__loaded[id="2"]';


        this.waitForSelector(menu,
            function pass() {
                this.waitForSelector(section,

                function pass() {
                    test.assertExists(menu, 'Menu item loaded');
                    test.assertExists(section, 'Section item loaded');

                    var section_top = this.getElementBounds(section).top;
                    var section_info = this.getElementInfo(section);

                    test.assert(section_top > 100, "Section's position should be > 100: " + section_top);

                },
                function fail() {
                    test.fail(section);
                }
            )},
            function fail() {
                test.fail(menu);
            }
        );

    }).then(function() {
        this.click('.source_nav .source_main_nav_li:nth-child(2) a');
        test.assertEquals(this.getCurrentUrl(), url+'#2', 'URL with hash is right')
    }).then(function() {
        var highlighted = '.source_nav .source_main_nav_li:nth-child(2).__active a.__active';
        var section = '.__loaded[id="2"]';

        this.waitForSelector(highlighted, function pass() {
            this.waitForSelector(section,
                function pass() {
                    test.assertExists(highlighted, 'Menu item highlighted');
                    test.assertExists(section, 'Section item loaded');

                    var section_top = this.getElementBounds(section).top;
                    test.assert(section_top < 100, "Section's position should be < 100: " + section_top);

                    var pageYOffset = this.getGlobal('pageYOffset');
                    test.assert(pageYOffset > 100, 'Page should be scrolled to section');
                },
                function fail() {
                    test.fail(section);
                }
            );
        }, function fail() {
            test.fail(highlighted);
        });

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

casper.test.begin('Hash link opening', 2, function suite(test) {
    casper.start(url + '#2').then(function() {
        var highlighted = '.source_nav .source_main_nav_li:nth-child(2).__active a.__active';

        this.waitForSelector(highlighted,
            function pass() {
                test.assertExists(highlighted, 'Menu item highlighted');

                var pageYOffset = this.getGlobal('pageYOffset');
                test.assert(pageYOffset > 100, 'Page should be scrolled to section');

            },
            function fail() {
                test.fail(highlighted);
            }
        );
    }).run(function() { test.done() }).clear();
});
