'use strict';

var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var cheerio = require('cheerio');

var ejs = require(path.join(global.pathToApp, 'core/ejsWithHelpers.js'));
var viewResolver = require(path.join(global.pathToApp + '/core/lib/viewResolver.js'));
var specUtils = require(path.join(global.pathToApp,'core/lib/specUtils'));

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
        var data = req.specData.renderedHtml.replace(/^\s+|\s+$/g, '');
        var $ = cheerio.load(data, { decodeEntities: false });

        req.specData.sections = _.map($('.' + req.specData.contextOptions.assets.SECTION_CLASS), function (item, index) {
            var section = $(item);
            var section_title = section.children().first().text();

            return {
              id: index + section_title.replace(/[^a-z0-9]/gi, '').toLowerCase(),
              title: section_title,
              children: [] // TODO
            };
        });

        next();
    } else {
        next();
    }
};
