/*!
 * SourceJS - Living Style Guides Engine and Integrated Maintenance Environment for Front-end Components
 * @copyright 2013-2015 Sourcejs.com
 * @license MIT license: http://github.com/sourcejs/sourcejs/wiki/MIT-License
 * */

requirejs.config({
    urlArgs: 'cb=' + Math.random(), /* to avoid caching */

    paths: {
        test: '/jasmine-test',
        jasmine: '/jasmine-test/jasmine/jasmine',
        'jasmine-html': '/jasmine-test/jasmine/jasmine-html'
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

    specs.push('spec/moduleSpec');
    specs.push('spec/sectionsSpec');
    specs.push('spec/innerNavigationSpec');

    $(function(){
        require(specs, function(){
            jasmineEnv.execute();
        });
    });

});
