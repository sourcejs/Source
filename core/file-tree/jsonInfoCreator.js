var fs = require('fs'),
    path = require('path');
    jsdom = require('jsdom');

// sourceMaster root path
var sourceRoot = '../../public';

// add directory name for exclude, write path from root ( Example: ['core','docs/base'] )
var excludedDirs = ['data','plugins','core','/node_modules','client','.idea','init','temp'];

// path to output file to write parsed data in json format
var outputFile = 'info.json';

// File mask for search
var fileMask = 'index.html';

// formatting RegExp for parser
var dirsForRegExp = '';
var i = 1;
excludedDirs.forEach(function(exlDir) {
    if (i<excludedDirs.length) {
        dirsForRegExp = dirsForRegExp+"^"+sourceRoot+exlDir+"|";
    } else {
        dirsForRegExp = dirsForRegExp+"^"+sourceRoot+exlDir;
    }
    i++;
});
var excludes = new RegExp(dirsForRegExp);

function fileTree(dir) {

    var dirContent = fs.readdirSync(dir);

    dirContent.forEach(function(file) {

        if (dir.match(excludes)) {return}

        var urlToFile = dir + '/' + file;

        urlToFile = path.normalize(urlToFile);
        var fileStats = fs.statSync(urlToFile);

        if (fileStats.isDirectory()) {

            fileTree(urlToFile)

        } else if (file == fileMask) {
            var arr = [];
            arr.push(data = fs.readFileSync(dir+'/'+file, "utf8"));
            arr.forEach(function(data) {
                jsdom.env(
                    data,
                    function (errors, window) {
                        if (window.document.getElementsByName('author')[0]!=null) {
                            var author = window.document.getElementsByName('author')[0].content;
                        }
                        if (window.document.getElementsByName('keywords')[0]!=null) {
                            var keywords = window.document.getElementsByName('keywords')[0].content;
                        }
                        if (window.document.querySelector('title')!=null) {
                            var title = window.document.querySelector('title').innerHTML;
                        }
                        if (window.document.querySelector('.source_info')!=null) {
                            var info = window.document.querySelector('.source_info').innerHTML;
                        }

                        var infoJson = {
                            author: author,
                            keywords: keywords,
                            title: title,
                            info: info
                        };

                        fs.writeFile(dir + "/"+outputFile, JSON.stringify(infoJson, null, 4), function(err) {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log("Pages tree JSON saved to "+dir + "/"+outputFile);
                            }
                        });
                    }
                );
            });
        }
    });
}
fileTree(sourceRoot);