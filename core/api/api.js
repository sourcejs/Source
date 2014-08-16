/**
 * Created by dmitrylapynov on 09/08/14.
 *
 * Sourcejs spec parser, using phantomjs
 */

var
    path = require('path'),
    fs = require('fs'),
    phantom = require('phantomjs'),
    childProcess = require('child_process'),
    pages_tree = require('/user/data/pages_tree.json'),
    pagesParser = require('./pagesParser'),
    exec = childProcess.exec,

    ph_path = phantom.path,
    url = 'http://127.0.0.1:8080',
    html = [],
    specs
    ;

var params = {
    obj: pages_tree,
    filter: ['mob'],
    flag: 'specFile'
};

specs = pagesParser(params);



for(var i = 0, l = specs.length; i < l; i++) {
    console.log('Starts...'+ i, specs[i]);
    var process = childProcess.exec(ph_path +" ph_modules/index.js "+ specs[i], handler);
}



function handler(error, stdout, stderr) {
    if (error) console.log('Exec error: '+ error);

    console.log('stderr: ', stderr);
    console.log(stdout);
    fs.writeFile('output/output'+ new Date()*1 +'.txt', stdout);

    if (stdout !== 'Ошибка в парсинге спецификации.') {
        var data = html.push(JSON.parse(stdout));
    } else {
        html.push['Ошибка в: '+ spec[i]];
    }
    console.log(data);
}


//var data = '';
//process.on('data', function (err, chunk) {
//    var data += chunk;
//});
//
//process.on('end', function (err, chunk) {
//   console.log('Channel over.')
//});

console.log('-- Done.');


