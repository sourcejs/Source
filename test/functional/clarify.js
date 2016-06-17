var appPort = casper.cli.get('app-port') || 8080;
var url = 'http://127.0.0.1:' + appPort + '/docs/test-specs/styles/';

casper.options.viewportSize = {width: 1024, height: 768};

casper.test.begin('Open clarify', 4, function suite(test) {
    casper.start(url).then(function() {
        var openClarifyLink = '.source_clarify-in-spec_link';

        this.waitForSelector(openClarifyLink,
            function pass() {
                this.click(openClarifyLink);
            },
            function fail() {
                test.fail('Failed opening clarify link.');
            }
        );

    }).then(function(){
         this.waitFor(
            function check() {
                return (this.getCurrentUrl() === url + '?clarify=true&sections=1');
            },
            function then() { // step to execute when check() is ok
                this.waitForSelector('.source_clarify_panel',
                    function pass() {
                        test.assertEquals(this.getCurrentUrl(), url + '?clarify=true&sections=1', 'Clarify url is corrent');
                        test.assertExists('.source_clarify_panel', 'Clarify panel exists');
                        test.assertExists('.source_example', 'Example exists');
                        test.assertEval(function () {
                            return document.querySelectorAll('.source_clarify_panel_sections option').length > 2;
                        }, 'Should show more than 2 sections in list');
                    },
                    function fail() {
                        test.fail('Failed searching for clarify link');
                    }
                );
            },
            function timeout() { // step to execute if check has failed
                this.echo('Failed to open clarify');
            }
        );
    }).run(function() { test.done() }).clear();
});
