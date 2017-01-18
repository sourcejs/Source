var appPort = casper.cli.get('app-port') || 8080;
var url = 'http://127.0.0.1:' + appPort;

casper.options.viewportSize = {width: 1024, height: 768};

casper.test.begin('Checking search', 3, function suite(test) {
    casper.start(url).then(function() {
        var _this = this;
        var input = '.source_search .source_search_it';
        var autoComplete = '.autocomplete-wrapper .autocomplete-suggestion:first-child a';
        var searchField = '.source_search_it[data-initialized]';

        test.assertExists(input, 'Search input exists');

        this.waitForSelector(searchField,
            function pass() {
                casper.sendKeys(searchField, 'getting started', {keepFocus: true});

                _this.waitForSelector(autoComplete,
                    function pass() {
                        this.click(autoComplete);
                    },
                    function fail() {
                        test.fail(autoComplete);
                    }
                );
            },
            function fail() {
                test.fail(searchField);
            }
        );

    }).then(function() {

        this.waitFor(
            function check() {
                return (this.getCurrentUrl() === url+'/docs/getting-started/');
            },
            function then() { // step to execute when check() is ok
                test.assertExists('.source_main > h1', 'Spec header exists');

                test.assertEquals(this.getCurrentUrl(), url+'/docs/getting-started/', 'New page URL is right')
            },
            function timeout() { // step to execute if check has failed
                this.echo('Failed to navigate to search result');
            }
        );

    }).run(function() { test.done() }).clear();
});
