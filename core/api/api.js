/**
 * Created by dmitrylapynov on 09/08/14.
 *
 * Sourcejs spec parser, using phantomjs
 */

var path = require('path');
var fs = require('fs');
var phantom = require('phantomjs');
var unflatten = require('./unflat');
var childProcess = require('child_process');
var exec = childProcess.exec;

var ph_path = phantom.path;
var url = 'http://127.0.0.1:8080';
var html = {};
var unflatten_html;

//temp
global.MODE = process.env.NODE_ENV || 'development';


var config = {
    pathToSpecs: './data/pages_tree.json'
};
// Overwriting base options
//deepExtend(config, global.opts.core.htmlParser);

var parseData = require('./parseData.js');
var parseSpecs = new parseData({
    scope: 'specs',
    path: require.resolve(config.pathToSpecs)
});

var specs = parseSpecs.getFilteredData({
    filter: {
        cats: ["base"]
    },
    filterOut: {
        tags: ['html']
    }
}, true);


// Preparing data for specs iteration
specs = specs.map(function(item){
    return item.url.substring(1);
});

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

    fs.writeFile(__dirname + '/log/output-'+ file +'.txt', stdout, function(err){
        if (err) console.log('Log write error', err);
    });

    html[spec] = JSON.parse(stdout);

console.log((doneCounter/specLength*100).toFixed(2),'%...Done', spec);

    doneCounter++;
    if (doneCounter == specLength) {
        var JSONformat = null;

        if (global.MODE === 'development') {
            JSONformat = 4;
        }

        fs.writeFile('html.json', JSON.stringify(html, null, JSONformat), function (err) {
            if (err) throw err;

            console.log('-- All specs were written.');
            unflatten_html =  unflatten(html, { delimiter: '/', overwrite: 'root' });
            console.log('-- All specs were saved.');

            // After all specs were both written in file and saved in memory.
            callback();
        });
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