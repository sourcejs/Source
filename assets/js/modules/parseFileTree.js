/*
*
* Module for parsing Source file tree data
*
* @author Robert Haritonov (http://rhr.me)
* @author Ivan Metelev
*
* */

'use strict';

define([
    'jquery',
    'sourceModules/module',
    'text!/api/specs/raw'], function ($, module, data) {

    function ParseFileTree() {
        this.json = $.parseJSON(data.toString());
    }

    /* наследуем от Module */
    ParseFileTree.prototype = module.createInstance();
    ParseFileTree.prototype.constructor = ParseFileTree;

    //getSpecificCat = a || [a,b] - Get only listed category, categories
    //getCatInfo = bool - Turn on cat info parsing
    /**
     * Abstract pages tree parser
     *
     * @params {String} getSpecificCat - Category name
     * @params {Boolean} getCatInfo - Get category info or not
     * @returns {Object} Return data object with specs
     *
     * @deprecated since version 0.4, use REST API instead
     */
    ParseFileTree.prototype.parsePages = function (getSpecificCat, getCatInfo) {
        var _this = this;
        var json = _this.json;
        var fileTree = {};
        var totalTree = {};

        var searchCat = function(currentCatObj, currentCat, toCheckCat) {

            var returnObject = function(returnedTreeObj, excludeRootDocument) {
                var isSingle = false;
                if (getSpecificCat.indexOf('specFile') === -1) {
                    for (var innerCat in returnedTreeObj) {
                        if ( _this.checkCatInfo(returnedTreeObj[innerCat], innerCat, getCatInfo) ) {
                            if (innerCat === 'specFile' && (!excludeRootDocument)) {
                                fileTree[innerCat] = {};
                                fileTree[innerCat]['specFile'] = returnedTreeObj[innerCat];
                            } else {
                                fileTree[innerCat] = returnedTreeObj[innerCat];
                            }
                        }
                    }
                } else {
                    fileTree['specFile'] = {};
                    fileTree['specFile']['specFile'] = returnedTreeObj;
                    isSingle = true;
                }
                return isSingle;
            };

            /*jshint forin: false */
            for (var currentSubCat in currentCatObj) {
                if (!currentCatObj.hasOwnProperty(currentSubCat)) {
                    continue;
                }
                var targetSubCatObj = currentCatObj[currentSubCat];

                if (typeof targetSubCatObj === 'object') {

                    //Need to collect only spec pages objects
                    if ( _this.checkCatInfo(targetSubCatObj, currentSubCat, getCatInfo) && _this.checkCat(currentCat, getSpecificCat, toCheckCat) ) {
                        //Checking if object is already there
                        if (typeof fileTree[currentSubCat] !== 'object') {
                            fileTree[currentCat + '/' + currentSubCat] = targetSubCatObj;
                        }

                    } else {
                        //Going deeper

                        if (getSpecificCat) { getSpecificCat = getSpecificCat.replace(/index.html/i, 'specFile'); }

                        var returnedTreeObj;
                        // complex/paths/handles/here
                        if ( (getSpecificCat !== undefined) && (getSpecificCat.indexOf('/') !== -1) ) {
                                var getSpecificCatArr = getSpecificCat.split('/');
                                var success = true;

                                if (getSpecificCatArr[ getSpecificCatArr.length-1 ] === '') {
                                    getSpecificCatArr.pop();
                                }

                                // absolute path
                                if (getSpecificCat.indexOf('/') === 0) {
                                    returnedTreeObj = _this.json;

                                    for (var i = 1; i < getSpecificCatArr.length; i++) {
                                        returnedTreeObj = returnedTreeObj[ getSpecificCatArr[i] ];
                                    }

                                    if (returnObject(returnedTreeObj, true)) return;

                                } else {
                                    //relative path

                                    var currentCheckCat = currentSubCat;
                                    returnedTreeObj = currentCatObj;

                                    for (var j = 0; j < getSpecificCatArr.length; j++) {
                                        if (_this.checkCat(currentCheckCat, getSpecificCatArr[j])) {
                                            currentCheckCat = getSpecificCatArr[j + 1];
                                        } else {
                                            success = false;
                                            break;
                                        }

                                        returnedTreeObj = returnedTreeObj[ getSpecificCatArr[j] ];
                                    }

                                    if (success) {
                                        if (returnObject(returnedTreeObj)) return;
                                    }
                                }

                        } else if (_this.checkCat(currentCat, getSpecificCat, toCheckCat)) {
                            //Turn off cat checking in this process, to get all inner folders

                            //Except other cats in specific cat search mode
                            if (typeof getCatInfo !== 'undefined') {

                                // Checking navigation page info
                                if (typeof targetSubCatObj['specFile'] !== 'object' ) {
                                    searchCat(targetSubCatObj, currentSubCat, true);
                                }

                            } else {
                                searchCat(targetSubCatObj, currentSubCat, true);
                            }

                        } else {
                            searchCat(targetSubCatObj, currentSubCat);
                        }

                    }
                }
            }
        };

        //Parse first level folders
        for (var currentCat in json) {
            if (json.hasOwnProperty(currentCat)) {
                var currentCatObj = json[currentCat];
                //Go inside first level folders
                searchCat(currentCatObj, currentCat);
                totalTree = $.extend(totalTree, fileTree);
            }
        }

        if (Object.getOwnPropertyNames(fileTree).length > 0) {
            return totalTree;
        }

    };

    ParseFileTree.prototype.checkCatInfo = function (targetSubCatObj, currentSubCat, getCatInfo) {
        if (targetSubCatObj) {

            //If cat info needed
            if (getCatInfo) {
                return typeof targetSubCatObj['specFile'] === 'object' || currentSubCat === 'specFile';
            } else {
                return typeof targetSubCatObj['specFile'] === 'object';
            }

        }
    };

    ParseFileTree.prototype.checkCat = function (currentCat, getSpecificCat, toCheckCat) {
        var checkCat = function() {

            //Multiple check cat support
            if (typeof getSpecificCat === 'string') {

                return getSpecificCat === currentCat;

            } else if (typeof getSpecificCat === 'object') { //If array

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
            if (typeof getSpecificCat !== 'undefined') {
                return checkCat();
            } else {
                return true;
            }
        }
    };

    /**
     * Get raw file tree JSON
     *
     * @returns {Object} Return raw file tree JSON
     *
     * @deprecated since version 0.4, use REST API instead
     */
    ParseFileTree.prototype.getParsedJSON = function() {
        return this.json;
    };

    /**
     * Get flat file tree with all specs
     *
     * @returns {Object} Return flat file tree
     *
     * @deprecated since version 0.4, use REST API instead
     */
    ParseFileTree.prototype.getAllPages = function () {
        //Get pages from all categories
        var fileTree = this.parsePages();
        var fileFlat = {};
        var _this = this;

        var lookForIndexOrGoDeeper = function(tree) {
            for (var folder in tree) {

                if (typeof tree[folder] === 'object') {
                    if ( !_this.checkCatInfo(tree[folder]) ) {

                        // Don't add specs without a title (or info.json)
                        if (tree['specFile'].title) {
                            var fullPath = tree['specFile'].url;
                            fileFlat[fullPath] = tree;
                        }

                    } else {
                        lookForIndexOrGoDeeper( tree[folder] );
                    }
                }
            }
        };

        lookForIndexOrGoDeeper(fileTree);
        return fileFlat;
    };

    /**
     * Get specific cat pages without category info
     *
     * @params {String} getSpecificCat - Category name
     * @returns {Object} Return data object with specs
     *
     * @deprecated since version 0.4, use REST API instead
     */
    ParseFileTree.prototype.getCatPages = function (getSpecificCat) {
        //Get cat pages
        return this.parsePages(getSpecificCat);
    };

    /**
     * Get specific cat pages with category
     *
     * @params {String} getSpecificCat - Category name
     * @returns {Object} Return data object with specs
     *
     * @deprecated since version 0.4, use REST API instead
     */
    ParseFileTree.prototype.getCatAll = function (getSpecificCat) {
        //Get cat pages with cat info
        return this.parsePages(getSpecificCat, true);
    };

    var getCurrCatalogSpec = function(navListDir, targetCatalog) {
        var catObj;
        if (!!targetCatalog[navListDir + '/specFile']) {
            catObj = targetCatalog[navListDir + '/specFile'];
        } else if (!!targetCatalog[ 'specFile' ]) {
            catObj = targetCatalog['specFile']['specFile']
                ? targetCatalog['specFile']['specFile']
                : targetCatalog['specFile'];
        }
        return catObj;
    };

    ParseFileTree.prototype.getCurrentCatalogSpec = function(catalogName) {
        if (!catalogName) return;
        var specsHash = this.parsePages(catalogName, true);
        return getCurrCatalogSpec(catalogName, specsHash);
    };

    ParseFileTree.prototype.getSortedCatalogsArray = function(catalogName, sortingCallback) {
        if (catalogName === undefined) return;
        var specsHash = catalogName.length
            ? this.parsePages(catalogName, true)
            : this.getAllPages();
        var result = $.map(specsHash, function(k, v) {
            k['name'] = v;
            return k['specFile'] ? [k] : undefined;
        });
        return result.sort(sortingCallback);
    };

    return new ParseFileTree();
});