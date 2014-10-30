'use strict';

var page = require('webpage').create();
var system = require('system');

// arguments from node exec task
var url = system.args[1];
var id = system.args[2];
var wrap = system.args[3];

page.open(url);

page.onLoadFinished = function (msg) {
	if (msg !== 'success') console.log('Server is not responding.');
	else {
        //TODO: create and check callback from templater
        setTimeout(function() {
            var code = page.evaluate(function (args) {

                var html = {};

                // collect style tag data and links to styles
                function getHeadData() {
                    var headTag = document.head;
                    var links = headTag.getElementsByTagName('link');
                    var linksArr = [];
                    var scripts = headTag.getElementsByTagName('script');
                    var scriptsArr = [];
                    var styleTag = headTag.getElementsByTagName('style')[0];
                    var styleTagHtml = (styleTag)? styleTag.outerHTML : "";

                    // links to styles
                    var i = 0;
                    var el;
                    while(i < links.length) {
                        el = links[i];

                        if(el.rel === 'stylesheet' || el.type === 'text/css') linksArr.push(el.outerHTML);
                        ++i;
                    }

                    // head scripts
                    i = 0;
                    while(i < scripts.length) {
                        el = scripts[i];

                        if( el.dataset['nonclarify'] ) {
                            ++i;
                            continue;
                        }
                        scriptsArr.push(el.outerHTML);
                        ++i;
                    }

                    if(styleTag) linksArr.push(styleTagHtml);
                    return [linksArr.join('\n'), scriptsArr.join('\n')];
                }


                // collect source_example code w/wo wrapper
                function getSource(id, wrap) {
                    var sources = document.getElementsByClassName('source_example');
                    var idArr = JSON.parse('['+ id +']');
                    var html = '';
                    wrap = (wrap === true || wrap === 'true') ? true : false;

                    idArr.forEach(function (el, i, arr) { arr.splice(i, 1, --el); });

                    var i = 0;
                    while(i < idArr.length) {
                        if (wrap) html += (sources[idArr[i]].outerHTML);
                        else html += (sources[idArr[i]].innerHTML);
                        ++i;
                    }

                    return {
                        "content": html,
                        "length": sources.length,
                        "id": id,
                        "idSum": idArr.length
                    };
                }

                // collect meta-data
                function getMeta() {
                    var doc = window.document;
                    var author = doc.getElementsByName('author')[0];
                    var keywords = doc.getElementsByName('keywords')[0];
                    var description = doc.getElementsByName('description')[0];

                    return {
                        "author": (author)? author.content : "",
                        "keywords": (keywords)? keywords.content : "",
                        "description": (description)? description.content : ""
                    };
                }


                try {
                    html.meta = getMeta();
                    html.title = document.title;
                    html.styles = getHeadData()[0];
                    html.scripts = getHeadData()[1];
                    html.source = getSource(args.id, args.wrap);
                } catch (e) {
                    if(e) {
                        html.err = e.name + '\f\n Wrong request. ' +
                            'May be block you looking for dont\'t ' +
                            'exist or has an you confuse .';
                    }
                }

                return html;

            }, {id: id, wrap: wrap});

        console.log(JSON.stringify(code, null, 1));
        }, 450);
	}
    /* global phantom */
    setTimeout(function(){
		phantom.exit();
    }, 450);
};

// error handler & logger: helps to avoid error stream within a common log
page.onError = function(msg, trace) {};
