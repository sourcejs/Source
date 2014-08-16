/**
 * Created by dmitrylapynov on 09/08/14.
 *
 * Sourcejs spec parser, using phantomjs
 */

var
    path = require('path'),
    fs = require('fs'),
    phantom = require('phantomjs'),
    unflatten = require('flat').unflatten,
    childProcess = require('child_process'),
    pages_tree = require('../../user/data/pages_tree.json'),
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
    filter: ['base'],
    flag: 'specFile'
};

specs = pagesParser(params);
var specLength = specs.length,
    doneCounter = 0;

specs.map(function (i, n) {
    console.log('Starts...' + n, i);

    childProcess.exec(ph_path + " ph_modules/index.js " + i, function (error, stdout, stderr) {
        handler(error, stdout, stderr, i, n);
    });
});


function handler(error, stdout, stderr, spec, n) {
    if (error) console.log('Exec error: '+ error);

//console.log('--- spec', spec);
    var path = spec && spec.split('/');
    var file = path.join('-');


    fs.writeFile('log/output-'+ file +'.txt', stdout);

    html[spec] = JSON.parse(stdout);

console.log('Done... ', doneCounter, '/', specLength,  spec);

    doneCounter++;
    if (doneCounter == specLength) {
        fs.writeFile('html.json', JSON.stringify(html));
        console.log('-- All specs has written.');
//        console.log(html);
        unflatten_html =  unflatten(html, { delimiter: '/'});
        debugger;
    }
}


//var data = '';
//process.on('data', function (err, chunk) {
//    var data += chunk;
//});
//
//process.on('end', function (err, chunk) {
//   console.log('Channel over.')
//});

console.log('-- file ends.');