var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var parseData = require("./parseData");
var pathToApp = path.dirname(require.main.filename);

var parseHTML = new parseData('html');
var parseSpecs = new parseData('specs');

// Api header config
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

router.get('/', function(req, res) {
	res.json({ message: 'Hello API' });
});

router.route('/specs')
    .post(function(req, res) {
        var data = {};
        var body = req.body;
        var reqID = body.id;
        var reqFilter = body.filter;
        var reqFilterOut = body.filterOut;

        if (parseSpecs.dataEsixts()) {
            if (reqID) {
                var dataByID = parseSpecs.getByID(body);

                if (dataByID && typeof dataByID === 'object') {
                    res.status(200).jsonp(dataByID);
                } else {
                    res.status(404).jsonp({
                        message: "id not found"
                    });
                }

            } else if (reqFilter || reqFilterOut) {
                var dataFiltered = parseSpecs.getFilteredData({
                    filter: reqFilter,
                    filterOut: reqFilterOut
                }, body);

                if (dataFiltered && typeof dataFiltered === 'object') {
                    res.status(200).jsonp(dataFiltered);
                }
            } else {
                data = parseSpecs.getAll(body);

                res.status(200).jsonp(data);
            }
        } else {
            res.status(404).jsonp({
                message: "pages_tree.json not found"
            });
        }
	});

router.route('/specs/html')
    .post(function(req, res) {
        var data = {};
        var body = req.body;
        var reqID = body.id;

        if (parseHTML.dataEsixts()) {

            if (reqID) {
                var dataByID = parseHTML.getByID(body);

                if (dataByID && typeof dataByID === 'object') {
                    res.status(200).jsonp(dataByID);
                } else {
                    res.status(404).jsonp({
                        message: "id not found"
                    });
                }

            } else {
                data = parseHTML.getAll(body);

                res.status(200).jsonp(data);
            }

        } else {
            res.status(500).jsonp({
                message: "HTML data not found"
            });
        }
	});

app.use('/api', router);