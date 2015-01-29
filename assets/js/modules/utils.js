/*
*
* Utils core for all modules
*
* */

SourceJS.define([
    'jquery',
    'source/load-options'
], function ($, options) {
    'use strict';

    var Utils = {};

    Utils.parseNavHash = function () {
        return window.location.hash.split(options.modulesOptions.innerNavigation.hashSymb)[0];
    };

    Utils.getUrlParameter = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec(location.search);

        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

     //sectionID = '#id'
    Utils.scrollToSection = function (sectionID) {
        // Modifying ID, for custom selection because of ids named "1.1", "2.2" etc
        var _sectionID = sectionID.replace('#','');
        var new_position = $(document.getElementById(_sectionID)).offset();

        var new_position_padding = 60; //Header height

        if (new_position) {
            window.scrollTo(new_position.left, new_position.top - new_position_padding);
        }
    };

    Utils.getSpecName = function() {
        var specName;
        var pageUrl = window.location.pathname;

        var pageUrlSplit = pageUrl.split("/"); //Разбивает на массив
        specName = pageUrlSplit[pageUrlSplit.length - 2]; //Берет последнюю часть урла

        return specName;
    };

    Utils.inherit = function(parent, child) {
        var F = function() {};
        child = child || function() {};
        F.prototype = parent.prototype;
        child.prototype = new F();
        child.prototype.constructor = child;
        child.parent = parent.prototype;
        return child;
    };

    Utils.getPathToPage = function(specUrlFromFileTree) {
        var pathToSpec = (function(){
            var path;

            //specUrl is used from parseFileTree, and contains only path, without file like "/docs/spec"
            if (typeof specUrlFromFileTree === 'undefined') {
                path = window.location.pathname;

                path = path.split("/"); //Breaking url to array
                path.splice(path.length - 1, 1); //Clear page.html from array
                path = path.join("/");
            } else {
                path = specUrlFromFileTree;
            }

            return path;
        }());

        return pathToSpec;
    };

    Utils.hasClasses = function(element, selectorsArr) {
        for (var i in selectorsArr) {
            if (element.hasClass(selectorsArr[i]))
                return true;
        }

        return false;
    };

    Utils.getCookie = function(name) {
		var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
		return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    Utils.isDevelopmentMode = function() {
		return Utils.getCookie('source-mode') === 'development';
    };

	Utils.isArray = function(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	};

    Utils.unifySpecPath = function(url) {
        if (url.slice(-10) === "index.html") url = url.slice(0, -10);
        if (url.slice(-9) === "index.src") url = url.slice(0, -9);
        if (url.charAt(0) !== "/") url = "/" + url;
        if (url.charAt(url.length - 1) === "/") url = url.slice(0, -1);

        return url;
    };

    Utils.toggleBlock = function(elToClick, elToShow) {
        var $elToClick = '.' + elToClick;

        $(document).on('click', $elToClick, function() {
            var $elToShow = $('.' + elToShow);

            $(this).toggleClass('__open');
            $elToShow.toggle();
        });
    };

    Utils.foldLeft = function(acc, object, callback) {
        var result;
        $.each(object, function(key, item) {
            result = callback(item, acc, key);
            if (result !== undefined) {
                acc = result;
            }
        });
        return acc;
    };

    Utils.getComponent = function(name) {
        return Utils.get(window.SourceJS, name);
    };

    Utils.isExist = function(name) {
        return !!Utils.getComponent(name);
    };

    Utils.get = function(obj, key, callback) {
        var keys = typeof key === "string"
            ? key.split(".")
            : key instanceof Array && key.length ? key : false;

        if (!keys || !obj) return null;
        var found = true;
        var iteration = function(_key, _data) {
            if (callback) {
                callback(_data, _key);
            }
            if (typeof _data[_key] === "undefined") {
                found = false;
            } else {
                return _data[_key];
            }
        };

        var value = keys.length === 1
            ? iteration(keys.pop(), obj)
            : Utils.foldLeft(obj, keys, iteration);
        return found ? value : null;
    };

    return Utils;
});