var appPort = casper.cli.get('app-port') || 8080;
var url = 'http://127.0.0.1:' + appPort + '/docs/';

casper.options.viewportSize = {width: 1024, height: 768};

casper.test.begin('Check navigaton page', 3, function suite(test) {
    casper.start(url).then(function() {
        var _this = this;
        var nav = '.source_catalog_list .source_catalog_list_i';

        this.waitForSelector(nav,
            function pass() {
                test.assertEval(function (nav) {
                    return document.querySelectorAll(nav).length > 5;
                }, 'Should have more than 5 nav items', [nav]);

                test.assertEval(function (nav) {
                    return (
                        !!document.querySelector(nav + ' .source_catalog_a[href="/docs/getting-started"]') &&
                        !!document.querySelector(nav + ' .source_catalog_a[href="/docs/spec-file"]') &&
                        !!document.querySelector(nav + ' .source_catalog_a[href="/docs/spec-json"]') &&
                        !!document.querySelector(nav + ' .source_catalog_a[href="/docs/spec-html"]') &&
                        !!document.querySelector(nav + ' .source_catalog_a[href="/docs/spec-markdown"]') &&
                        !!document.querySelector(nav + ' .source_catalog_a[href="/docs/spec-ejs"]') &&
                        true
                    );
                }, 'Right nav items in set', [nav]);
            },
            function fail() {
                test.fail(nav);
            }
        );

    }).then(function(){
        this.click('.source_catalog_image-tumbler');
        test.assertExists('.source_catalog.__show-preview', 'Show preview toggled');

    }).run(function() { test.done() }).clear();
});
