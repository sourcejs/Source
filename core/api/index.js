var express = require('express');
var path = require('path');
var parseData = require("./parseData");
var pathToApp = path.dirname(require.main.filename);
var deepExtend = require('deep-extend');

var config = {
    statusCodes: {
        OK: 200,
        notFound: 404,
        error: 500
    }
};
// Overwriting base options
deepExtend(config, global.opts.core.api);


var getSpecs = function (req, res, parseObj) {
    var data = {};
    var body = req.body;
    var reqID = body.id || req.query.id;
    var reqFilter = body.filter;
    var reqFilterOut = body.filterOut;
    var parsedData = parseObj;

    if (reqID) {
        var dataByID = parsedData.getByID(reqID);

        if (dataByID && typeof dataByID === 'object') {
            res.status(config.statusCodes.OK).json(dataByID);
        } else {
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
            res.status(config.statusCodes.notFound).json({
                message: "data not found"
            });
        }
    } else {
        data = parsedData.getAll();

        if (data) {
            res.status(config.statusCodes.OK).json(data);
        } else {
            res.status(config.statusCodes.notFound).json({
                message: "data not found"
            });
        }
    }
};

var getHTML = function (req, res, parseObj) {
    var data = {};
    var body = req.body;
    var reqID = body.id || req.query.id;
    var parsedData = parseObj;

    if (reqID) {
        var dataByID = parsedData.getByID(reqID);

        if (dataByID && typeof dataByID === 'object') {
            res.status(config.statusCodes.OK).json(dataByID);
        } else {
            res.status(config.statusCodes.notFound).json({
                message: "id not found"
            });
        }

    } else {
        data = parsedData.getAll();

        if (data) {
            res.status(config.statusCodes.OK).json(data);
        } else {
            res.status(config.statusCodes.notFound).json({
                message: "data not found"
            });
        }
    }
};

// Main API router
var apiRouter = express.Router();

var parseHTML = new parseData({
    scope: 'html',
    path: path.join(pathToApp, config.htmlData)
});

var parseSpecs = new parseData({
    scope: 'specs',
    path: path.join(pathToApp, config.specsData)
});

apiRouter.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
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
        getSpecs(req, res, parseSpecs)
    });

apiRouter.route('/specs/html')
    .get(function (req, res) {
        getHTML(req, res, parseHTML)
    });

app.use('/api', apiRouter);



// Test API router
var apiTestRouter = express.Router();

var parseSpecsTest = new parseData({
    scope: 'specs',
    path: path.join(pathToApp, config.specsTestData)
});

var parseHTMLTest = new parseData({
    scope: 'html',
    path: path.join(pathToApp, config.htmlTestData)
});

apiTestRouter.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

apiTestRouter.get('/', function(req, res) {
	res.json({ message: 'API Testig env' });
});

apiTestRouter.route('/specs')
    .get(function (req, res) {
        getSpecs(req, res, parseSpecsTest)
    });

apiTestRouter.route('/specs/html')
    .get(function (req, res) {
        getHTML(req, res, parseHTMLTest)
    });

app.use('/api-test', apiTestRouter);