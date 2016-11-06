var appPort = casper.cli.get("app-port") || 8080;
var url = 'http://127.0.0.1:' + appPort;

casper.options.viewportSize = {width: 1024, height: 768};

var urlsToCheck = [
    url,
    url + '/docs/test-specs/styles/',
    url + '/docs/'
];

var error = {};

casper.on("page.error", function(msg, trace) {
    error.msg = msg;

    this.echo("Error:    " + msg, "ERROR");
    this.echo("file:     " + trace[0].file, "WARNING");
    this.echo("line:     " + trace[0].line, "WARNING");
    this.echo("function: " + trace[0]["function"], "WARNING");
});

urlsToCheck.forEach(function(item){
    casper.test.begin('Check availability and JS errors on ' + item, 2, function(test) {
        error = {};

        casper.start(item).then(function(response) {

            casper.wait(500, function(){
                // Slow down a bit, because of strange API bug
            });

            if (response.status !== 200) {
                test.fail("Page load error, expected status 200, got " + response.status);
            } else {
                test.pass("Status 200 OK");
            }
        }).then(function() {
            if (typeof error.msg === 'string') {
                test.fail("JS errors found: "+ error.msg);
            } else {
                test.pass("No JS errors");
            }

        }).run(function() { test.done() }).clear();
    });
});
