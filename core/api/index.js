var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var parseData = require("./parseData");
var pathToApp = path.dirname(require.main.filename);

var parseHTML = new parseData('html');
var parseSpecs = new parseData('specs');

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
        var reqID = req.body.id;

        if (parseSpecs.dataEsixts()) {
            if (reqID) {
                var dataByID = parseSpecs.getByID(reqID);

                if (dataByID && typeof dataByID === 'object') {
                    res.status(200).jsonp(dataByID);
                } else {
                    res.status(404).jsonp({
                        message: "id not found"
                    });
                }

            } else {
                data = parseSpecs.getAll();
                res.status(200).jsonp(data);
            }
        } else {
            res.status(200).jsonp({
                message: "pages_tree.json not found"
            });
        }
	});

router.route('/specs/html')
    .post(function(req, res) {
        var data = {};
        var reqID = req.body.id;

        if (parseHTML.dataEsixts()) {

            if (reqID) {
                var dataByID = parseHTML.getByID(reqID);

                if (dataByID && typeof dataByID === 'object') {
                    res.status(200).jsonp(dataByID);
                } else {
                    res.status(404).jsonp({
                        message: "id not found"
                    });
                }

            } else {
                data = parseHTML.getAll();
                res.status(200).jsonp(data);
            }

        } else {
            res.status(500).jsonp({
                message: "HTML data not found"
            });
        }
	});

app.use('/api', router);