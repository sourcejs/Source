define(['jquery'], function($) {
    "use strict";

    var _userStorageKey = 'sourcejsUser';

    var auth = function() {
        open('/auth/stub', 'popup', 'width=1015,height=500');
    };

    var drawLoginControl = function() {
        if (isLoginned()) {
            console.log('drawLogined', getUser());
        } else {
            console.log('drawUnlogined', getUser());
        }
    };

    var authCallback  = function(user) {
        localStorage.setItem(_userStorageKey, user);
        drawLoginControl();
    };

    var unAuth = function() {
        localStorage.removeItem(_userStorageKey);
        drawLoginControl();
    };

    var isLoginned = function() {
        return !!localStorage['user'];
    };

    var getUser = function() {
        return JSON.parse(localStorage.getItem(_userStorageKey) || "");
    };

    return {
        "login": auth,
        "logout": unAuth,
        "isLoginned": isLoginned,
        "getUser": getUser,
        "done": authCallback
    };
});