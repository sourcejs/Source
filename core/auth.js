var everyauth = require('everyauth');
var fs = require('fs');
var ejs = require('./ejsWithHelpers.js');
var path = require('path');

module.exports = function(app) {
    "use strict";

    app.states = app.states || {};
    app.states.users = app.states.users || {};

    var currentUserId = "";

    // users data processing
    /**
     * @method getUser - user getter
     *
     * @param {String} id - github user id
     *
     * @returns {Object} - user - github user entity or empty object, if user is undefined
     */
    var getUser = function(id) {
        return app.states.users[id] || {};
    };

    /**
     * @method setUser - user setter
     *
     * @param {Object} user - github user entity
     *
     * @param {String} user.id - required user field, which is used as user templral storage key.
     *
     * @returns {Object} user - returns user parameter
     */
    var setUser = function(user) {
        if (typeof user !== "object" || !user.id) return;
        app.states.users[user.id] = user;
        return user;
    };

    everyauth.everymodule.findUserById(function(id, callback) {
        callback(null, getUser(id));
    });

    // TODO: separated id & secret for dev mode
    everyauth.github
        .appId(global.opts.github.appId)
        .appSecret(global.opts.github.appSecret)
        .findOrCreateUser(function(sess, accessToken, accessTokenExtra, ghUser) {
            setUser(ghUser);
            currentUserId = ghUser.id;
            return ghUser;
        })
        .redirectPath('/auth/done');


    everyauth.everymodule.handleLogout( function (req, res) {
        delete req.session.authCache;
        req.logout();
        this.redirect(res, this.logoutRedirectPath());
    });

    // application routes
    var authTemplate = fs.readFileSync(path.join(global.pathToApp, '/core/views/auth-done.ejs'), "utf8");
    app.get('/auth/stub', function (req, res) {
        res.send(ejs.render(authTemplate, {
            user: JSON.stringify({})
        }));
    });

    app.get('/auth/done', function (req, res) {
        req.session.authCache = req.session.auth;

        res.send(ejs.render(authTemplate, {
            user: JSON.stringify(getUser(currentUserId))
        }));
    });

    return {
        getUser: getUser,
        setUser: setUser,
        everyauth: everyauth
    };

};
