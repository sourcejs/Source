'use strict';

var _ = require('lodash');

/**
* Processing pre-ejs rendering on spec request
*
* @param {object} req - Request object
* @param {object} res - Response object
* @param {function} next - The callback function
* */
exports.process = function(req, res, next) {
    // Check if spec is request
    if (req.specData && req.specData.info && req.specData.info.role !== 'navigation') {
        req.placeholders = req.placeholders || {};
        req.placeholders.sidecontent = req.placeholders.sidecontent || [];

        req.placeholders.sidecontent = _.concat(req.placeholders.sidecontent, req.specData.sections.map(function (item) {return item.header;}).join('<br/>'));
        next();
    } else {
        next();
    }
};
