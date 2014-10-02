'use strict';

/**
 * In case if request contains rendered html, then send it as response and stop spec content post-processing.
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function (req, res, next) {
    if (req.specData && req.specData.renderedHtml) {
        res.send(req.specData.renderedHtml);
    } else {
        next();
    }
};