/*
*
* Utils core for all modules
*
* */

define([
    'jquery',
    'sourceModules/module'
    ], function ($, module) {

    'use strict';

    function Utils() {}

    /* наследуем от Module */
    Utils.prototype = module.createInstance();
    Utils.prototype.constructor = Utils;

    Utils.prototype.parseNavHash = function () {
        return window.location.hash.split(this.options.modulesOptions.innerNavigation.hashSymb)[0];
    };

    Utils.prototype.scrollToSection = function (sectionID) { //sectionID = '#id'
        var new_position = $(sectionID).offset();
        var new_position_padding = 60; //Header heights

        if (new_position) {

            $('html, body').animate({
				scrollTop: (new_position.top - new_position_padding)
			 }, 300);
        }
    };

    Utils.prototype.getSpecName = function() {
        var specName;
        var pageUrl = window.location.pathname;

        var pageUrlSplit = pageUrl.split("/"); //Разбивает на массив
        specName = pageUrlSplit[pageUrlSplit.length - 2]; //Берет последнюю часть урла

        return specName;
    };

    Utils.prototype.getPathToPage = function(specUrlFromFileTree) {
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

    Utils.prototype.hasClasses = function(element, selectorsArr) {
        for (var i in selectorsArr) {
            if (element.hasClass(selectorsArr[i]))
                return true;
        }

        return false;
    };

    Utils.prototype.getCookie = function(name) {
		var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
		return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    Utils.prototype.isDevelopmentMode = function() {
		return this.getCookie('source-mode') === 'development';
    };

	Utils.prototype.isArray = function(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	};

    Utils.prototype.unifySpecPath = function(url) {
        if (url.slice(-10) === "index.html") url = url.slice(0, -10);
        if (url.slice(-9) === "index.src") url = url.slice(0, -9);
        if (url.charAt(0) !== "/") url = "/" + url;
        if (url.charAt(url.length - 1) === "/") url = url.slice(0, -1);

        return url;
    };

    Utils.prototype.toggleBlock = function(elToClick, elToShow) {
        var $elToClick = '.' + elToClick;

        $(document).on('click', $elToClick, function() {
            var $elToShow = $('.' + elToShow);

            $(this).toggleClass('__open');
            $elToShow.toggle();
        });
    };

    return new Utils();
});