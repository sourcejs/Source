'use strict';

var path = require('path');
var prettyHrtime = require('pretty-hrtime');
var trackStats = require(path.join(global.pathToApp, 'core/trackStats'));

/**
 * In case if request contains rendered html, then send it as response and stop spec content post-processing.
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function (req, res, next) {
    if (req.specData && req.specData.renderedHtml) {
        trackStats.specs(req);

        global.log.trace('Spec loading time: ', prettyHrtime(process.hrtime(global.specLoadTime)));

        res.send(req.specData.renderedHtml);
    } else {
        next();
    }
};
