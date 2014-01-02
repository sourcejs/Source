var
	fs = require('fs'),
	url = require('url'),
	path = require('path'),
	exec = require('child_process').exec,
	jsdom = require('jsdom'),
	dom = require('./dom'),
	jady = require('./jady');

var
	opts = require('../options'),
	publicPath = opts.common.pathToSpecs;


module.exports = function reply(req, res, next) {
	var
		parsedUrl = url.parse(req.url, true),
		urlPath = parsedUrl.pathname,
		urlHost = req.headers.host,
		urlAdress = (parsedUrl.protocol || "") + urlHost + urlPath,
		tpl = parsedUrl.query.get,
		id = parsedUrl.query.id,
		wrap = parsedUrl.query.wrap || true,
        phantom = parsedUrl.query.ph || false;
//debugger;


//// if we have query on index.html
	if (path.basename(parsedUrl.path).indexOf('index.html') != -1 && parsedUrl.query.get) {
// reading file..
		fs.readFile(publicPath + '/' + urlPath, function (err, data) {
            var responseData = data || '';

            if (err) res.end('Huston, we have 404.\n'+ err);

            if (responseData !== '') {

                // make data for template
                function reqHandler(res, html) {
                    if (html.source) {
                        //// переменные для Jade
                        var locals = {
                            head: {
                                title: html.title,
                                mAuthor: html.meta.author,
                                mKeywords: html.meta.keywords,
                                mDescription: html.meta.description,
                                scripts: html.scripts,
                                stylesheets: html.styles
                            },
                            body: {
                                spec: html.source.content,
                                specLength: html.source.length,
                                specId: html.source.id,
                                specIdSum: html.source.idSum,
                                homeLink: 'http://'+ urlAdress
                            },
                            pretty: true
                        };

                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                        res.end(jady(locals, tpl));

                    } else res.end('STDOUT: can\'t recieve content.');
                }


        // if using PhantomJs
                if (phantom) {

                    var params = "sudo core/clarify/phantomjs "+
                        "core/clarify/phantom/ph.js "+
                        "http://"+ urlAdress +" "+ id +" "+ wrap;

                    // executes ph.js via phantomjs like separate child process
                    exec(params, function (err, stdout, stderr) {
                        if (err) console.log('Exec report error: ' + err);
                        else {
                            try {
                                var html = JSON.parse(stdout);
                            } catch(e) {
                                html = 'Parsing error: ' + e;
                            }
        // PhantomJS output
        console.log(html);
        // got to show some view
                            reqHandler(res, html);
                        }
                    });

                }
        // jsdom starts
                else {
                    jsdom.env(responseData.toString(), function (err, win) {
        // 	     		jsdom.env(publicPath + '/' + urlPath, function (err, win) { // url mode
                        if (err) console.log('JSdom report error: ' + err);
                        else {
                            console.log('JSDOM', wrap);
                            var
                                doc = win.document,
                                html = {};

                            try {
                                html.title = doc.title;
                                html.meta = dom.getMeta(doc);
                                html.styles = dom.getHeadData(doc)[0];
                                html.scripts = dom.getHeadData(doc)[1];
                                html.source = dom.getSource(doc, id, wrap);
                            } catch (e) {
                                html.err = {
                                    text: e,
                                    type: e.name
                                };
                            }
        console.log(html);

        // got to show some view
                            reqHandler(res, html);
                        }
                    });
                }

            }
		});
	} else next();
};



// TODO: check list below
// [done] beatify HTML output
// [done] create JSON with data from <HEAD>
// [done] parse several blocks in same page with one request
// [done] switchers to another specs from cleared one;
// [..partial] client-side UI controls to clarify specs
// [done] phantomjs -> jsdom
// [...] support for other template engines
// * [] connect custom templates and scripts
// * [] avoid hardcoded paths
// [done] clear template - @param {GET} clr
// * [] use css/js optionally by GET params
// * [] save user session settings
// * [] try POST instead GET
// * [] Ajax
// * [] link from already clarified code to original spec page
// * [] phantomjs error with try to get unavaliable script
// * [] screenshots by phatnomjs
// * [] phantomjs: not to close session (improve perfomance?);
// * [] buttons  to add custom libraries to clarified page (jQuery, require);
// * [] another context templates [mob, clr, ...]
