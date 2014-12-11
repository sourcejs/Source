'use strict';

// modules
var fs = require('fs');
var url = require('url');
var path = require('path');
var exec = require('child_process').exec;
var jsdom = require('jsdom');
var dom = require('./dom');
var jady = require('./jady');

// custom vars & local dependencies
var publicPath = global.opts.core.common.pathToUser;

module.exports = function reply(req, res, next) {
	var
		parsedUrl = url.parse(req.url, true),
		urlPath = parsedUrl.pathname,
		urlHost = req.headers.host,
		urlAdress = (parsedUrl.protocol || "") + urlHost + urlPath,

        q = parsedUrl.query,
		tpl = q.get,
		id = q.id,
		wrap = q.wrap || true,
        phantom = q.ph || false,
        nojs = q.nojs || false,
        extname = path.extname(urlPath);

    // check for clarify usage (todo: transfer this check to router)
	if (parsedUrl.query.get) {

        var exts = ['.html', '.src'],
            extsLen = exts.length;

        if (!extname) {
            while(extsLen--) {
                if (fs.existsSync(publicPath + '/' + urlPath + "index" + exts[extsLen])) {
                    urlPath += ("index" + exts[extsLen]);
                }
            }
        }

		fs.readFile(publicPath + '/' + urlPath, function (err, data) {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('No such file.\n'+ err);
                return;
            }

// make data for template
            function reqHandler(res, html) {
                if (html.source) {
// Jade's vars
                    var locals = {
                        head: {
                            title: html.title,
                            mAuthor: html.meta.author,
                            mKeywords: html.meta.keywords,
                            mDescription: html.meta.description,
                            scripts: (nojs)?  null : html.scripts,
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

// send headers and close request
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    res.end(jady(locals, tpl));

                } else  {
                    res.end('STDOUT: can\'t recieve content.\n'+ html.err.text);
                }
            }


// Phantom
            if (phantom) {

                var params = "core/clarify/phantomjs "+
                        "core/clarify/phantom/ph.js "+
                        "http://"+ urlAdress +" "+ id +" "+ wrap;

                    exec(params, function (err, stdout, stderr) {
                        if (err) {
                            res.end('Exec report error:\n ' + err);
                        } else {
                            var html;

                            try {
                                html = JSON.parse(stdout);
                            } catch(e) {
                                html = 'Parsing error: ' + e;
                            }

                            // template render function
                            reqHandler(res, html);
                        }
                    });
// JSDom
            } else {
                jsdom.env(data.toString(), function (err, win) {
            //  jsdom.env(publicPath + '/' + urlPath, function (err, win) { // url mode
                    if (err) res.end('JSdom report error:\n ' + err);
                    else {
                        var doc = win.document;
                            var html = {};

                            try {
                                html.title = doc.title;
                                html.meta = dom.getMeta(doc);
                                if (extname !== '.src') {
                                    html.styles = dom.getHeadData(doc)[0];
                                    html.scripts = dom.getHeadData(doc)[1];
                                }
                                html.source = dom.getSource(doc, id, wrap);
                            } catch (e) {
                                html.err = {
                                    text: e,
                                    type: e.name
                                };
                            }

                            // template render function
                            reqHandler(res, html);
                        }
                    });
                }

		});

	} else next();
};



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