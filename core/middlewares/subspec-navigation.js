'use strict';

var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');

var ejs = require(path.join(global.pathToApp, 'core/ejsWithHelpers.js'));
var viewResolver = require(path.join(global.pathToApp + '/core/lib/viewResolver.js'));
var specUtils = require(path.join(global.pathToApp,'core/lib/specUtils'));

/**
* Processing pre-ejs rendering on spec request
*
* @param {object} req - Request object
* @param {object} res - Response object
* @param {function} next - The callback function
* */
exports.process = function(req, res, next) {
    req.placeholders = req.placeholders || {};
    req.placeholders.sidecontent = req.placeholders.sidecontent || [];

    // Check if spec is request and ejs pre-rendering enabled
    if (req.specData && req.specData.info && req.specData.info.role !== 'navigation') {
        global.console.log(req.specData);
        req.placeholders.sidecontent = _.concat(req.placeholders.sidecontent, 'subspec-navigation.js: Hello world!');
        next();
    } else {
        next();
    }
};
