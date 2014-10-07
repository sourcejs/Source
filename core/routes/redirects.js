/*
    This file contains default redirects, to add custom redirects user /user/core/routes/index.js
*/

var path = require('path');
var express = require('express');
var pathToApp = path.dirname(require.main.filename);

// First, check if there's minified assets
global.app.use('/source/assets', express.static(pathToApp + '/build/assets'));
global.app.use('/assets', express.static(pathToApp + '/build/'+ global.opts.core.common.pathToUser +'/assets'));

// Redirecting core client-side file requests to app root paths
global.app.use('/source/assets', express.static(pathToApp + '/assets'));
global.app.use('/docs', express.static(pathToApp + '/docs'));
global.app.use('/test', express.static(pathToApp + '/assets/test'));