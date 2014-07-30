/*!
 * SourceJS - IME for front-end components documentation and maintenance
 * @copyright 2014 Sourcejs.com
 * @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
 * */

requirejs.config({
    urlArgs: 'cb=' + Math.random(), /* to avoid caching */

    paths: {
        test: '/test',
        jasmine: '/test/jasmine/jasmine',
        'jasmine-html': '/test/jasmine/jasmine-html'
    },

    shim: {
        'jasmine': {
            exports: 'jasmine'
        },
        'jasmine-html': {
            deps: ['jasmine'],
            exports: 'jasmine'
        }
    }
});

require(['jquery', 'jasmine-html'], function($, jasmine){

    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
    };

    var specs = [];

    specs.push('test/spec/moduleSpec');
    specs.push('test/spec/sectionsSpec');
    specs.push('test/spec/innerNavigationSpec');

    $(function(){
        require(specs, function(){
            jasmineEnv.execute();
        });
    });

});