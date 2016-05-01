'use strict';

/*
*
* This file contains default redirects, to add custom redirects user /user/core/routes/index.js
*
* */

var path = require('path');
var express = require('express');
var pathToApp = path.dirname(require.main.filename);
var interceptor = require('express-interceptor');

var finalParagraphInterceptor = interceptor(function (req, res) {
    return {
        isInterceptable: function () {
            // console.log('res.originalUrl', req.originalUrl, /\/source\/assets\/js/.test(req.originalUrl) && !(/\/require.bundle.js$/.test(req.originalUrl)));

            return /\/source\/assets\/js/.test(req.originalUrl) && !(/\/require.bundle.js$/.test(req.originalUrl));
        },
        // Appends a paragraph at the end of the response body
        intercept: function (body, send) {
            if (
                (/require\(/.test(body) && !(/sourcejs\.amd\.require\(/.test(body))) ||
                (/define\(/.test(body) && !(/sourcejs\.amd\.define\(/.test(body)))
            ) {
                body = '// Modified on static serve from `redirects.js` \n (function(require, define){\n' + body + '\n}(sourcejs.amd.require, sourcejs.amd.define))';

                if (!(/\/source\/assets\/js\/lib/.test(req.originalUrl))) {
                    global.log.warn('Deprecation Notice: please update "' + req.originalUrl + '" to use sourcejs.amd.require/sourcejs.amd.define namespace for Requirejs modules.');
                }
            }

            send(body);
        }
    };
});

global.app.use(finalParagraphInterceptor);


/*
*
* Static routing for SourceJS assets include custom config and follow this priority queue:
* 1. First check if we have overridden assets from `sourcejs/user/source/assets`
* 2. Then check if we have minified version of assets in `sourcejs/build/assets`
* 3. And if nothing found before, app send original assets from `source/assets` folder
*
* Engine main build script also minifies CSS and HTML from `sourcejs/user/assets` and puts it in `sourcejs/build/user/assets`
*
* */

// Check overrides from user folder
global.app.use('/source/assets', express.static(path.join(pathToApp, global.opts.core.common.pathToUser, 'source/assets')));

// Check if minified assets available
global.app.use('/source/assets', express.static(path.join(pathToApp,'build/assets')));
global.app.use('/assets', express.static(path.join(pathToApp, 'build', global.opts.core.common.pathToUser, 'assets')));

// Redirecting core client-side file requests to app root paths
global.app.use('/source/assets', express.static(path.join(pathToApp, 'assets')));


// Custom routes
global.app.use('/docs', express.static(path.join(pathToApp, '/docs')));
global.app.use('/test', express.static(path.join(pathToApp, '/test')));
global.app.use('/jsdoc', express.static(path.join(pathToApp, '/jsdoc')));
global.app.use('/jasmine-test', express.static(path.join(pathToApp, '/assets/test')));