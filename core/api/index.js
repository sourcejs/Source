var express = require('express');
var path = require('path');
var parseData = require("./parseData");
var pathToApp = path.dirname(require.main.filename);

var getSpecs = function (req, res, parseObj) {
    var data = {};
    var body = req.body;
    var reqID = body.id;
    var reqFilter = body.filter;
    var reqFilterOut = body.filterOut;
    var parsedData = parseObj;

    if (reqID) {
        var dataByID = parsedData.getByID(reqID);

        if (dataByID && typeof dataByID === 'object') {
            res.status(200).json(dataByID);
        } else {
            res.status(404).json({
                message: "id not found"
            });
        }

    } else if (reqFilter || reqFilterOut) {
        var dataFiltered = parsedData.getFilteredData({
            filter: reqFilter,
            filterOut: reqFilterOut
        });

        if (dataFiltered && typeof dataFiltered === 'object') {
            res.status(200).json(dataFiltered);
        } else {
            res.status(404).json({
                message: "data not found"
            });
        }
    } else {
        data = parsedData.getAll();

        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({
                message: "data not found"
            });
        }
    }
};

var getHTML = function (req, res, parseObj) {
    var data = {};
    var body = req.body;
    var reqID = body.id;
    var parsedData = parseObj;

    if (reqID) {
        var dataByID = parsedData.getByID(reqID);

        if (dataByID && typeof dataByID === 'object') {
            res.status(200).json(dataByID);
        } else {
            res.status(404).json({
                message: "id not found"
            });
        }

    } else {
        data = parsedData.getAll();

        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({
                message: "data not found"
            });
        }
    }
};

// Main API router
var apiRouter = express.Router();

var parseHTML = new parseData({
    scope: 'html',
    path: path.join(pathToApp, '/html.json')
});

var parseSpecs = new parseData({
    scope: 'specs',
    path: path.join(global.app.get('user'), 'data/pages_tree.json')
});

apiRouter.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

apiRouter.get('/', function(req, res) {
	res.json({ message: 'Hello API' });
});

apiRouter.route('/specs')
    .post(function (req, res) {
        getSpecs(req, res, parseSpecs)
    });

apiRouter.route('/specs/html')
    .post(function (req, res) {
        getHTML(req, res, parseHTML)
    });

app.use('/api', apiRouter);



// Test API router
var apiTestRouter = express.Router();

var parseSpecsTest = new parseData({
    scope: 'specs',
    path: path.join(pathToApp, 'test', 'api-test-specs.json')
});

var parseHTMLTest = new parseData({
    scope: 'html',
    path: path.join(pathToApp, 'test', 'api-test-html.json')
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
    .post(function (req, res) {
        getSpecs(req, res, parseSpecsTest)
    });

apiTestRouter.route('/specs/html')
    .post(function (req, res) {
        getHTML(req, res, parseHTMLTest)
    });

app.use('/api-test', apiTestRouter);