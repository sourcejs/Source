# CasperJS code snippets

Timeout

```
casper.wait(1000, function () {
});
```

Screenshot

```
this.capture('test.png');

this.capture('test.png', {
    top: 0,
    left: 0,
    width: 1024,
    height: 768
});
```

Wait for

```
_this.waitForSelector(autoComplete,
    function pass() {
        this.click(autoComplete);
    },
    function fail() {
        test.fail(autoComplete);
    }
);

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
```

Eval

```
var nav = 'some'
test.assertEval(function (nav) {
    return document.querySelectorAll(nav).length > 5;
}, 'Should have more than 5 nav items', [nav]);

var js = this.evaluate(function() {
    return document;
});
this.echo(js.all[0].outerHTML);
```
