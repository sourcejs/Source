var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var pathToApp = path.dirname(require.main.filename);

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

router.get('/', function(req, res) {
	res.json({ message: 'Hello API' });
});

router.route('/specs')
    .get(function(req, res) {
        var data = JSON.parse(fs.readFileSync(global.app.get('user') + '/data/pages_tree.json', 'utf8'));

		res.jsonp(data);
	});

router.route('/specs/html')
    .get(function(req, res) {
        var data = JSON.parse(fs.readFileSync(pathToApp + '/html.json', 'utf8'));

		res.jsonp(data);
	});

router.route('/specs/:id')
    .get(function(req, res) {
        var param = req.params.id;

		res.send(param);
	});

app.use('/api', router);