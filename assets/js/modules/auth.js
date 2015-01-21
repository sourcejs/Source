define([
    'jquery',
    'sourceModules/module'
], function($, module) {
    
    'use strict';

    /**
     * @Object default module option values
     */
    var defaults = {
        'storageKey': 'sourcejsUser',
        'defaultAvatarURL': '/source/assets/i/unknown.gif',
        'classes': {
            'controlsWrapper': 'sjs-login',
            'loginButton': 'sjs-login-button',
            'avatar': 'sjs-login-avatar'
        },
        'labels': {
            'login': 'Login',
            'logout': 'Logout'
        }
    };

    /**
     * @constructor Auth
     * @param [Object] config - auth inline configuration set of options
     * @param [Object] config.target - jquery domElement which goes to be auth controlls container
     * @param [Object] config.options - options set
     */

    function Auth(config) {
        var _this = this;

        this.conf = $.extend(true, {},
            defaults,
            config.options
        );

        this.target = config.target || $(this.conf.classes.controlsWrapper);
        this.popup;

        $(function() {
            _this.init();
        });
    }


    Auth.prototype = module.createInstance();
    Auth.prototype.constructor = Auth;

    Auth.renderers = {};

    Auth.prototype = {
        login: function() {
            this.popup = open('/auth/stub', 'popup', 'width=1015,height=500');
        },

        init: function() {
            var self = window.__auth = this;
            this.render();

            $('body').on('click', '.' + this.conf.classes.loginButton, function(e) {
                e.preventDefault();
                if (self.isLoginned()) {
                    self.logout();
                } else {
                    self.login();
                }
            });
        },

        render: function() {
            var user = this.getUser();
            this.target.html('')
                .append($('<img class="' + this.conf.classes.avatar + '" src="'
                    + (!!user.avatar_url ? user.avatar_url : this.conf.defaultAvatarURL)
                    + '">'
                ))
                .append($('<div class="' + this.conf.classes.loginButton + '">'
                    + (!!user.id ? this.conf.labels.logout : this.conf.labels.login)
                    + '</div>'
                ));
        },

        logout: function() {
            localStorage.removeItem(this.conf.storageKey);
            this.render();
        },

        isLoginned: function() {
            return !!localStorage[this.conf.storageKey];
        },

        getUser: function() {
            return JSON.parse(localStorage.getItem(this.conf.storageKey) || "{}");
        },

        done: function(user) {
            this.popup.close();
            localStorage.setItem(this.conf.storageKey, JSON.stringify(user));
            this.render();
        }
    };

    return Auth;
});