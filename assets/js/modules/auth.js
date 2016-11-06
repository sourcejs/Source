sourcejs.amd.define([
    'jquery',
    'sourceModules/module'
], function($, Module) {

    'use strict';

    /**
     * @Object default module option values
     */
    var defaults = {
        'storageKey': 'sourcejsUser',
        'defaultAvatarURL': '/source/assets/i/unknown.gif',
        'classes': {
            'controlsWrapper': 'source_login',
            'loginButton': 'source_login-button',
            'avatar': 'source_login-avatar',
            'anonymous': 'anonymous',
            'hook': 'js-hook'
        },
        'labels': {
            'login': 'Login',
            'logout': 'Logout'
        }
    };

    /**
     * @module Auth - basic GitHub authorization module.
     *
     * @constructor
     *
     * @param [Object] config - auth inline configuration set of options
     *
     * @param [Object] config.target - jquery domElement which goes to be auth controlls container
     *
     * @param [Object] config.options - options set, which allows to define component configuration.
     */

    function Auth(config) {
        var _this = this;

        this.conf = $.extend(true, {},
            defaults,
            config.options,
            this.options.modulesOptions.auth
        );

        this.target = config.target || $(this.conf.classes.hook);
        if(!$(this.target).hasClass(this.conf.classes.controlsWrapper)) {
            $(this.target).addClass(this.conf.classes.controlsWrapper);
        }
        this.popup;

        $(function() {
            _this.init();
        });
    }

    Auth.prototype = Module.createInstance();
    Auth.prototype.constructor = Auth;

    Auth.renderers = {
        'avatar': function() {
            var hasAvatar = this.user && this.user.avatar_url;
            this.target.append($([
                    '<img class="', this.conf.classes.avatar, ' ',
                    (hasAvatar ? '' : this.conf.classes.anonymous), '" src="',
                    (hasAvatar ? this.user.avatar_url : this.conf.defaultAvatarURL),
                    '">'
                ].join('')
            ));
        },
        'loginButton': function() {
            this.target.append($([
                    '<div class="', this.conf.classes.loginButton, '">',
                    (this.user && this.user.id ? this.conf.labels.logout : this.conf.labels.login),
                    '</div>'
                ].join('')
            ));
        }
    };

    /**
     * @method Auth.login.
     * This function initiates logging in process and creates github login popup.
     */
    Auth.prototype.login = function() {
        this.popup = open('/auth/stub', 'popup', 'width=1015,height=500');
    };

    /**
     * @method Auth.logout.
     * This method removes existed user entity and refreshes control.
     */
    Auth.prototype.logout = function() {
        localStorage.removeItem(this.conf.storageKey);
        this.render();
    };

    /**
     * @method Auth.isLoginned User state getter.
     *
     * @returns {Boolean} isLoginned. It returns true if user is loginned.
     */
    Auth.prototype.isLoginned = function() {
        return !!localStorage[this.conf.storageKey];
    };

    /**
     * @method Auth.getUser GitHub user entity getter.
     *
     * @returns {Object} user || null.
     * If user is loginned it returns user object and null in other case.
     */
    Auth.prototype.getUser = function() {
        return this.isLoginned()
            ? JSON.parse(localStorage.getItem(this.conf.storageKey))
            : null;
    };

    Auth.prototype.init = function() {
        window.sourcejs = window.sourcejs || {};
        var self = window.sourcejs.__auth = this;
        this.render();
        $('body').on('click', '.' + this.conf.classes.loginButton, function(e) {
            e.preventDefault();
            if (self.isLoginned()) {
                self.logout();
            } else {
                self.login();
            }
        });
    };

    Auth.prototype.render = function() {
        var user = this.getUser();
        var self = this;
        this.target.html('');
        Object.keys(Auth.renderers).forEach(function(name) {
            Auth.renderers[name].call({
                'target': self.target,
                'user': user,
                'conf': self.conf
            });
        });
    };

    Auth.prototype.done = function(user) {
        this.popup.close();
        localStorage.setItem(this.conf.storageKey, JSON.stringify(user));
        this.render();
    };

    return Auth;
});
