/*
 * Source - Front-end documentation engine
 * @copyright 2013 Sourcejs.com
 * @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
 * */

requirejs.config({
    baseUrl: '/core/js',
    urlArgs: 'cb=' + Math.random(), /* to avoid caching */

    paths: {
        core: '/core/js',
        modules: '/core/js/modules',
        lib: '/core/js/lib',
        templates: '/core/templates',
        plugins: '/plugins',
        user: '/user',
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