module.exports = function(app) {
	"use strict";

	var everyauth = require('everyauth');
	var fs = require('fs');
	var path = require('path');

	app.states = app.states || {};
	app.states.users = app.states.users || {};

	var currentUserId = "";

	// users data processing
	var getUser = function(id) {
		id = id;
		return app.states.users[id];
	};

	var setUser = function(user) {
		app.states.users[user.id] = user;
		return user;
	};

	// TODO: remove debug mode or change it according to current environment
	everyauth.debug = true;

	everyauth.everymodule.findUserById(function(id, callback) {
		console.log('findUserById', id);
		console.log(callback);
		callback(null, getUser(id));
	});

	// TODO: separated id & secret for dev mode
	everyauth.github
		.appId(global.opts.github.appId)
		.appSecret(global.opts.github.appSecret)
		.findOrCreateUser(function(sess, accessToken, accessTokenExtra, ghUser) {
			setUser(ghUser);
			currentUserId = ghUser.id;
			return ghUser;//getUser(ghUser.id) || setUser(ghUser);
		})
		.redirectPath('/auth/done');


	everyauth.everymodule.handleLogout( function (req, res) {
		delete req.session.authCache;
		req.logout();
		this.redirect(res, this.logoutRedirectPath());
	});

	// application routes
	var authTemplate = fs.readFileSync(path.join(global.pathToApp, '/assets/templates/auth-done.ejs'), "utf8");
	app.get('/auth/stub', function (req, res) {
		res.send(require('ejs').render(authTemplate, {'user': "{}"}));
	});

	app.get('/auth/done', function (req, res) {
		req.session.authCache = req.session.auth;
		res.send(require('ejs').render(authTemplate, {'user': JSON.stringify(getUser(currentUserId))}));
	});

	app.use(everyauth.middleware());

};