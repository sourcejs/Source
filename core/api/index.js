'use strict';

var express = require('express');
var path = require('path');
var parseData = require(path.join(global.pathToApp, 'core/lib/parseData'));
var utils = require(path.join(global.pathToApp, 'core/lib/utils'));
var pathToApp = path.dirname(require.main.filename);
var htmlTree = require(path.join(global.pathToApp, 'core/html-tree'));
var unflatten = require(path.join(global.pathToApp,'core/unflat'));

var config = {
    statusCodes: {
        OK: 200,
        notFound: 404,
        error: 500
    }
};
// Overwriting base options
utils.extendOptions(config, global.opts.core.api);

var specsDataPath = path.join(pathToApp, config.specsData);
var htmlDataPath = path.join(pathToApp, config.htmlData);

/**
 * getSpecs REST api processor
 *
 * @param {Object} req - express request
 * @param {Object} res - express response
 * @param {Object} parseObj - initiated parseData instance
 *
 * Writes result to res object
 */
var getSpecs = function (req, res, parseObj) {
    var data = {};
    var body = req.body;
    var reqID = body.id || req.query.id;
    var cats = body.cats || req.query.cats;
    var reqFilter = body.filter || req.query.filter;
    var reqFilterOut = body.filterOut || req.query.filterOut;
    var parsedData = parseObj;

    var msgDataNotFound = 'API: Specs data not found, please restart the app.';

    if (reqID) {
        var dataByID = parsedData.getByID(reqID);

        if (dataByID && typeof dataByID === 'object') {
            res.status(config.statusCodes.OK).json(dataByID);
        } else {
            if (typeof dataByID === 'undefined') console.warn(msgDataNotFound);

            res.status(config.statusCodes.notFound).json({
                message: "id not found"
            });
        }

    } else if (reqFilter || reqFilterOut) {
        var dataFiltered = parsedData.getFilteredData({
            filter: reqFilter,
            filterOut: reqFilterOut
        });

        if (dataFiltered && typeof dataFiltered === 'object') {
            res.status(config.statusCodes.OK).json(dataFiltered);
        } else {
            console.warn(msgDataNotFound);

            res.status(config.statusCodes.notFound).json({
                message: "data not found"
            });
        }
    } else {
        data = parsedData.getAll(cats);

        if (data) {
            res.status(config.statusCodes.OK).json(data);
        } else {
            console.warn(msgDataNotFound);

            res.status(config.statusCodes.notFound).json({
                message: "data not found"
            });
        }
    }
};

/**
 * getHTML REST api processor
 *
 * @param {Object} req - express request
 * @param {Object} res - express response
 * @param {Object} parseObj - initiated parseData instance
 *
 * Writes result to res object
 */
var getHTML = function (req, res, parseObj) {
    var data = {};
    var body = req.body;
    var reqID = body.id || req.query.id;
    var reqSections = body.sections || req.query.sections;
    var sections = reqSections ? reqSections.split(',') : undefined;
    var parsedData = parseObj;

    var msgDataNotFound = 'API: HTML data not found, please sync API or run PhantomJS parser.';

    if (reqID) {
        var responseData = '';

        if (reqSections) {
            responseData = parsedData.getBySection(reqID, sections);
        } else {
            responseData = parsedData.getByID(reqID);
        }

        if (responseData && typeof responseData === 'object') {
            res.status(config.statusCodes.OK).json(responseData);
        } else {
            if (typeof responseData === 'undefined') console.warn(msgDataNotFound);

            res.status(config.statusCodes.notFound).json({
                message: "id and requested sections not found"
            });
        }
    } else {
        data = parsedData.getAll();

        if (data) {
            res.status(config.statusCodes.OK).json(data);
        } else {
            console.warn(msgDataNotFound);

            res.status(config.statusCodes.notFound).json({
                message: "data not found"
            });
        }
    }
};

/**
 * postHTML REST api processor
 *
 * @param {Object} req - express request
 * @param {Object} req.body.data - data to write
 * @param {Boolean} req.body.unflatten - set true, to unflat tree from 'base/spec'
 *
 * @param {Object} res - express response
 * @param {String} dataPath - custom data storage path
 *
 * Writes result to res object
 */
var postHTML = function (req, res, dataPath) {
    var body = req.body;
    var data = body.data;
    var dataUnflatten = body.unflatten;

    if (dataUnflatten) {
        data = unflatten(data, { delimiter: '/', overwrite: 'root' });
    }

    htmlTree.writeDataFile(data, true, dataPath, function(err, finalData){
        if (err || !finalData) {
            res.status(config.statusCodes.error).json({
                message: err
            });
        } else {
            res.status(config.statusCodes.OK).json(finalData);
        }
    });
};

/**
 * postHTML DELETE api processor
 *
 * @param {Object} req - express request
 * @param {Object} req.body.path - data path for deletion
 *
 * @param {Object} res - express response
 * @param {String} dataPath - custom data storage path
 *
 * Writes result to res object
 */
var deleteHTML = function (req, res, dataPath) {
    var body = req.body;
    var reqID = body.id || req.query.id;

    htmlTree.deleteFromDataFile(dataPath, reqID, function(err, finalData){
        if (err || !finalData) {
            res.status(config.statusCodes.error).json({
                message: err
            });
        } else {
            res.status(config.statusCodes.OK).json(finalData);
        }
    });
};

/**
 * If app is running in presentation mode, handle response with stub
 *
 * @param {Object} req - express request
 * @param {Object} res - express response
 *
 * Writes result to res object
 */
var presentationHandler = function (req, res) {
    res.json({ message: 'API is running in presentation mode, no write operations permited.' });
};

/* Main API router */
var apiRouter = express.Router();

var parseHTMLData = new parseData({
    scope: 'html',
    path: htmlDataPath
});

var parseSpecs = new parseData({
    scope: 'specs',
    path: specsDataPath
});

apiRouter.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

apiRouter.get('/', function(req, res) {
	res.json({ message: 'Hello API' });
});

apiRouter.route('/specs/raw')
    .get(function (req, res) {
        var data = parseSpecs.getRaw();

        if (data) {
            res.status(config.statusCodes.OK).json(data);
        } else {
            res.status(config.statusCodes.notFound).json({
                message: "data not found"
            });
        }
    });

apiRouter.route('/specs')
    .get(function (req, res) {
        getSpecs(req, res, parseSpecs);
    });

apiRouter.route('/specs/html')
    .get(function (req, res) {
        getHTML(req, res, parseHTMLData);
    })
    .post(function (req, res) {
        if (global.MODE === 'presentation') {
            presentationHandler(req, res);
        } else {
            postHTML(req, res, htmlDataPath);
        }
    })
    /* jshint es5:false */
    .delete(function (req, res) {
        if (global.MODE === 'presentation') {
            presentationHandler(req, res);
        } else {
            deleteHTML(req, res, htmlDataPath);
        }
    });

// Activating router
global.app.use('/api', apiRouter);
/* Main API router */



/* Test API router */
// TODO: find alternative way for testing API, without custom route

var apiTestRouter = express.Router();
var specsDataTestPath = path.join(pathToApp, config.specsTestData);
var htmlDataTestPath = path.join(pathToApp, config.htmlTestData);

var parseSpecsTest = new parseData({
    scope: 'specs',
    path: specsDataTestPath
});

var parseHTMLDataTest = new parseData({
    scope: 'html',
    path: htmlDataTestPath
});

apiTestRouter.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

apiTestRouter.get('/', function(req, res) {
	res.json({ message: 'API Testig env' });
});

apiTestRouter.route('/specs')
    .get(function (req, res) {
        getSpecs(req, res, parseSpecsTest);
    });

apiTestRouter.route('/specs/html')
    .get(function (req, res) {
        getHTML(req, res, parseHTMLDataTest);
    })
    .post(function (req, res) {
        if (global.MODE === 'presentation') {
            presentationHandler(req, res);
        } else {
            postHTML(req, res, htmlDataTestPath);
        }
    })
    .delete(function (req, res) {
        if (global.MODE === 'presentation') {
            presentationHandler(req, res);
        } else {
            deleteHTML(req, res, htmlDataTestPath);
        }
    });

// Activating router
global.app.use('/api-test', apiTestRouter);
/* /Test API router */