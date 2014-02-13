/*
*
* Utils core for all modules
*
* */

define([
    'jquery',
    'modules/module'
    ], function ($, module) {

    function Utils() {}

    /* наследуем от Module */
    Utils.prototype = module.createInstance();
    Utils.prototype.constructor = Utils;

    Utils.prototype.parseNavHash = function () {
        var
            urlHash = window.location.hash,
            urlHashSplit = urlHash.split(this.options.modulesOptions.innerNavigation.hashSymb);

        return urlHashSplit[0];
    };

    Utils.prototype.scrollToSection = function (sectionID) { //sectionID = '#id'
        var
            new_position = $(sectionID).offset(),
            new_position_padding = 60; //Header heights

        if (new_position) {
            window.scrollTo(new_position.left, new_position.top - new_position_padding);
        }
    };

    Utils.prototype.getSpecName = function() {
        var specName,
            pageUrl = window.location.pathname;

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

    return new Utils();
});