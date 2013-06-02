/*
*
* Module for parsing Source file tree data
*
* @author Robert Haritonov (http://rhr.me)
*
* */

define([
    'jquery',
    'modules/module',
    'text!/data/pages_tree.json'], function ($, module, data) {

    function ParseFileTree() {
        var _this = this;

        this.roleNavigation = module.options.roleNavigation,

        this.json = $.parseJSON(data.toString());
    }

    /* наследуем от Module */
    ParseFileTree.prototype = module.createInstance();
    ParseFileTree.prototype.constructor = ParseFileTree;

    //getSpecificCat = a || [a,b] - Get only listed category, categories
    //getCatInfo = bool - Turn on cat info parsing
    ParseFileTree.prototype.parsePages = function (getSpecificCat, getCatInfo) {
        var _this = this,
            json = _this.json,
            getSpecificCat = getSpecificCat,
            fileTree = {};

        var searchCat = function(currentCatObj, currentCat, toCheckCat) {
            for (var currentSubCat in currentCatObj) {
                var targetSubCatObj = currentCatObj[currentSubCat];

                if (typeof targetSubCatObj === 'object') {

                    //Need to collect only spec pages objects
                    if ( _this.checkCatInfo(targetSubCatObj, currentSubCat, getCatInfo) && _this.checkCat(currentCat, getSpecificCat, toCheckCat) ) {

                        //Checking if object is already there
                        if (typeof fileTree[currentSubCat] != 'object') {
                            fileTree[currentSubCat] = targetSubCatObj;
                        }

                    } else {

                        //Going deeper
                        if (_this.checkCat(currentCat, getSpecificCat, toCheckCat)) {
                            //Turn off cat checking in this process
                            searchCat(targetSubCatObj, currentSubCat, true);
                        } else {
                            searchCat(targetSubCatObj, currentSubCat);
                        }

                    }
                }
            }
        };

        //Parse first level folders
        for (var currentCat in json) {
            var currentCatObj = json[currentCat];

            //Go inside first level folders
            searchCat(currentCatObj, currentCat);
        }

        return fileTree;

    };

    ParseFileTree.prototype.checkCatInfo = function (targetSubCatObj, currentSubCat, isOn) {
        var _this = this;

        if (isOn) {
            return typeof targetSubCatObj['index.html'] === 'object' || currentSubCat === 'source_page_navigation';
        } else {
            return typeof targetSubCatObj['index.html'] === 'object';
        }
    };

    ParseFileTree.prototype.checkCat = function (currentCat, getSpecificCat, toCheckCat) {
        var _this = this,
            getSpecificCat = getSpecificCat,
            currentCat = currentCat,
            toCheckCat = toCheckCat;

        var checkCat = function() {
            if (typeof getSpecificCat === 'string') {

                return getSpecificCat === currentCat;

            } else if (typeof getSpecificCat === 'object') {

                var something = false;

                for (var i = 0; i < getSpecificCat.length; i++) {

                    if (getSpecificCat[i] === currentCat) {
                        something = true;

                        break;
                    }
                }

                return something;

            } else {
                return false;
            }
        };

        //Turn off cat checking in specific process
        if (toCheckCat === true) {
            return true;
        } else {
            //Check if cat checking is set
            if (typeof getSpecificCat != 'undefined') {
                return checkCat();
            } else {
                return true;
            }
        }
    };

    ParseFileTree.prototype.getAllPages = function () {
        var _this = this;

        //Get pages from all categories
        return _this.parsePages();
    };

    ParseFileTree.prototype.getCatPages = function (getSpecificCat) {
        var _this = this;

        return _this.parsePages(getSpecificCat);
    };

    ParseFileTree.prototype.getCatAll = function (getSpecificCat) {
        var _this = this;

        return _this.parsePages(getSpecificCat, true);
    };

    return new ParseFileTree();
});