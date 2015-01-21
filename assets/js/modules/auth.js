define(['jquery'], function($) {
    "use strict";

    var _userStorageKey = 'sourcejsUser';
    var loginWrapperSelector = '.sjs-login';
    var defaultAvatarURL = '/source/assets/i/unknown.gif';
    var labels = {
        login: "Login",
        logout: "Logout"
    };
    var popup;

    var login = function() {
        popup = open('/auth/stub', 'popup', 'width=1015,height=500');
    };

    var drawLoginControl = function() {
        var $wrapper = $(loginWrapperSelector);
        var user = getUser();
        $wrapper
            .html('')
            .append($('<img class="sjs-login-avatar" src="' + (!!user.avatar_url ? user.avatar_url : defaultAvatarURL) + '">'))
            .append($('<div class="sjs-login-button">' + (!!user.id ? labels.logout : labels.login) + '</div>'));
    };

    var authCallback  = function(user) {
        popup.close();
        localStorage.setItem(_userStorageKey, JSON.stringify(user));
        drawLoginControl();
    };

    var logout = function() {
        localStorage.removeItem(_userStorageKey);
        drawLoginControl();
    };

    var isLoginned = function() {
        return !!localStorage[_userStorageKey];
    };

    var getUser = function() {
        return JSON.parse(localStorage.getItem(_userStorageKey) || "{}");
    };

    return {
        "login": login,
        "logout": logout,
        "isLoginned": isLoginned,
        "getUser": getUser,
        "done": authCallback,
        "drawControls": drawLoginControl
    };
});