/**
 * Created by dmitrylapynov on 09/08/14.
 *
 * Sourcejs spec parser, using phantomjs
 */

var
    path = require('path'),
    fs = require('fs'),
    phantom = require('phantomjs'),
    unflatten = require('./unflat'),
    childProcess = require('child_process'),
    pages_tree = require('data/pages_tree.json'), //TODO: must be updated automatically
    pagesParser = require('./pagesParser'),
    exec = childProcess.exec,

    ph_path = phantom.path,
    url = 'http://127.0.0.1:8080',
    html = {},
    unflatten_html,
    specs
    ;

var params = {
    obj: pages_tree,
    filter: ['mob'],
    flag: 'specFile'
};

specs = pagesParser(params);
var specLength = specs.length,// specs.length
    doneCounter = 0;

// debug only
//specs.length = 10;

specs.map(function (elem, n) {
    console.log('Starts...' + n, elem);

    function callback() {
        console.log('-- All specs were processed.')
    }

    childProcess.exec(ph_path + " ph_modules/index.js " + elem, function (error, stdout, stderr) {
        handler(error, stdout, stderr, elem, n, callback);
    });
});


function handler(error, stdout, stderr, spec, n, callback) {
    if (error) console.log('Exec error: \f'+ error);

//console.log('--- spec', spec);
    var path = spec && spec.split('/');
    var file = path.join('-');


    fs.writeFile('log/output-'+ file +'.txt', stdout);
    if (path == 'mob/base') return;
    html[spec] = JSON.parse(stdout);

console.log((doneCounter/specLength*100).toFixed(2),'%...Done', spec);

    doneCounter++;
    if (doneCounter == specLength) {
        fs.writeFile('html.json', JSON.stringify(html));
        console.log('-- All specs were written.');
//        console.log(html);
        unflatten_html =  unflatten(html, { delimiter: '/', overwrite: 'root' });
        console.log('-- All specs were saved.');

        // After all specs were both written in file and saved in memory.
        callback();
    }
}

console.log('-- file ends.');

// from old Clarify:
// TODO: check list below
// [done] beatify HTML output
// [done] create JSON with data from <HEAD>
// [done] parse several blocks in same page with one request
// [done] switchers to another specs from cleared one;
// [done] clear template - @param {GET} clr
// [done] phantomjs -> jsdom
// [..partial] client-side UI controls to clarify specs
// [...] support for other template engines
// * [] diffrernt links to phantomjs relative to OS
// * [] connect custom templates and scripts
// * [] avoid hardcoded paths
// * [] use css/js optionally by GET params
// * [] save user session settings
// * [] try POST instead GET
// * [] Ajax
// * [] link from already clarified code to original spec page
// * [] phantomjs error with try to get unavaliable script
// * [] screenshots by phatnomjs
// * [] phantomjs: not to close session (improve perfomance?);
// * [] buttons  to add custom libraries to clarified page (jQuery, require);
// * [in progress..] another context templates [mob, clr, ...]