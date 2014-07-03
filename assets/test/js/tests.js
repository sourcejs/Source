/*!
 * SourceJS - IME for front-end components documentation and maintenance
 * @copyright 2014 Sourcejs.com
 * @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
 * */

requirejs.config({
    baseUrl: "/source/assets/js",
    urlArgs: 'cb=' + Math.random(), /* to avoid caching */

    paths: {
        // /source/assets requests are routed to /assets
        source: '/source/assets/js',
        sourceModules: '/source/assets/js/modules',
        sourceLib: '/source/assets/js/lib',
        sourceJam: '/source/assets/jam',
        sourceTemplates: '/source/assets/templates',

        js: "/assets/js",
        plugins: '/plugins',
        npmPlugins: '/node_modules',

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