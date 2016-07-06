'use strict';

var path = require('path');

var pathToApp = path.dirname(require.main.filename);
var specsParser = require(path.join(pathToApp, 'core/lib/specPageParser'));



/**
* Enriching specData with sections
*
* @param {object} req - Request object
* @param {object} res - Response object
* @param {function} next - The callback function
* */
exports.process = function(req, res, next) {
    // Check if spec is request
    if (req.specData && req.specData.info && req.specData.info.role !== 'navigation') {
        req.specData.sections = specsParser.process(req.specData.renderedHtml).contents;
        next();
    } else {
        next();
    }
};
