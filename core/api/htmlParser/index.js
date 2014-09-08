/**
 * Created by dmitrylapynov on 09/08/14.
 *
 * Sourcejs spec parser, using phantomjs
 */

var path = require('path');
var fs = require('fs-extra');
var phantom = require('phantomjs');
var unflatten = require('./unflat');
var childProcess = require('child_process');
var exec = childProcess.exec;

var ph_path = phantom.path;
var url = 'http://127.0.0.1:8080';
var html = {};
var unflatten_html;
var errorCounter = {};

//temp
global.MODE = process.env.NODE_ENV || 'development';


var config = {
    errorLimit: 2,
    pathToSpecs: '../data/pages_tree.json'
};
// Overwriting base options
//deepExtend(config, global.opts.core.htmlParser);

var parseData = require('./../parseData.js');
var parseSpecs = new parseData({
    scope: 'specs',
    path: require.resolve(config.pathToSpecs)
});

var specs = parseSpecs.getFilteredData({
    filter: {
        cats: ['base']
    },
    filterOut: {
        tags: ['html','lego-hide']
    }
}, true);


// Preparing data for specs iteration
specs = specs.map(function(item){
    return item.url.substring(1);
});

var specLength = specs.length,// specs.length
    doneCounter = 0;

try {
    fs.removeSync(path.join(__dirname, '../log', 'error'));
} catch(e) {}

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
    var specPath = spec && spec.split('/');
    var file = specPath.join('-');

    var writeLog = function(subPath){
        var _subPath = subPath || '';
        var logPath = path.join(__dirname, '../log', _subPath);

        var data = {
            spec: spec,
            error: error,
            stdount: JSON.parse(stdout),
            stderr: stderr
        };

        var writeFile = function(){
            fs.writeFile(path.join(logPath, 'output-'+ file +'.json'), JSON.stringify(data, null, 4), function(err){
                if (err) console.log('Log write error', err);
            });
        };

        fs.readdir(logPath, function(err) {
            if (err) {
                fs.mkdir(logPath, function(err) {
                    if (err) {
                        console.log('Log dir creation error', err);
                    } else {
                        writeFile();
                    }
                })
            } else {
                writeFile();
            }
        });
    };

    if (error) {
        var currentErrorCounter = errorCounter[spec];

        if (typeof currentErrorCounter !== 'number') {
             errorCounter[spec] = currentErrorCounter = 0;
        }

        errorCounter[spec] = currentErrorCounter++;

        // If limit is not reached, try again
        if (currentErrorCounter <= config.errorLimit) {
            console.log('Rerun', spec);

            childProcess.exec(ph_path + " ph_modules/index.js " + spec, function (error, stdout, stderr) {
                handler(error, stdout, stderr, spec, n, callback);
            });
            return;
        }

        console.log('Exec error on spec ' + spec + ': \f'+ error);
        writeLog('error');
    } else {
        writeLog();
    }

    // Then unflattened
    html[spec+'/specFile/contents'] = JSON.parse(stdout);

    console.log((doneCounter/specLength*100).toFixed(2),'%...Done', spec);

    doneCounter++;
    if (doneCounter == specLength) {
        var JSONformat = null;

        if (global.MODE === 'development') {
            JSONformat = 4;
        }

        unflatten_html =  unflatten(html, { delimiter: '/', overwrite: 'root' });

        //TODO: Dmitry, add more data filesd according to hmtl-stub.json
        fs.writeFile('../data/html.json', JSON.stringify(unflatten_html, null, JSONformat), function (err) {
            if (err) throw err;

            console.log('-- All specs were saved.');

            // After all specs were both written in file and saved in memory.
            callback();
        });
    }
}

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