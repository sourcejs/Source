/*
*
* @author Robert Haritonov (http://rhr.me)
*
* */

define([
    "core/options"
    ], function(options) {

    //TODO: make localstorage caching
    //TODO: combine plugin with globalNav

    /*
    *
    * Main func
    *
    * */

    //Get max http://ejohn.org/blog/fast-javascript-maxmin/
    Array.max = function (array) {
        return Math.max.apply(Math, array);
    };

    var CATALOG = 'source_catalog',
        CATALOG_LIST = 'source_catalog_list',
        CATALOG_LIST_I = 'source_catalog_list_i',

        CATALOG_LIST_ALL = 'source_catalog_all',
            CATALOG_LIST_ALL_A = 'source_a_o',

        CATALOG_LIST_A = 'source_catalog_a source_a_g',
        CATALOG_LIST_A_TX = 'source_catalog_a_tx',
        CATALOG_LIST_DATE = 'source_catalog_date',
        CATALOG_LIST_BUBBLES = 'source_bubble',

        PAGES_DATA = "/data/pages_tree.json",

        RES_LINK_TO_ALL = 'All',
        RES_AUTHOR = 'Author',
        RES_JSON_ERROR = 'Error loading JSON',
        RES_NO_DATA = 'Data-nav attr not set',

        L_CATALOG = $('.' + CATALOG),

        catTree = {},

        pageLimit = 999;

    if (options.pluginsOptions.globalNav) {
        if (options.pluginsOptions.globalNav.pageLimit != undefined) {
            pageLimit = options.pluginsOptions.globalNav.pageLimit;
        }
    }

    function sortByBubbles(a, b) {
        a = parseInt(a['index.html'].bubbles);
        b = parseInt(b['index.html'].bubbles);

        if(a == b) return 0;
        else {
            return (a > b) ? -1 : 1;
        }
    }

    function sortByDate(a, b) {
        a = parseInt(a['index.html'].lastmodSec);
        b = parseInt(b['index.html'].lastmodSec);

        if(a == b) return 0;
        else {
            return (a > b) ? -1 : 1;
        }
    }

    function sortByAlpha(a, b) {
        a = a['index.html'].title;
        b = b['index.html'].title;

        if(a == b) return 0;
        else {
            return (a > b) ? 1 : -1;
        }
    }

    var makeSome = function(data) {
        /*
        *
        * Preparing data from JSON for parsing
        *
        * */
        var buildCatTree = function(rootCat, subCat, subCatObj) {

            //check if category has child pages for navigation
            if (typeof subCatObj['source_page_navigation'] === 'object') {

                //Go deeper for nested cats
                searchCat(subCat, subCatObj);

            } else {

                //First define
                if (typeof catTree[rootCat] != 'object') {
                    catTree[rootCat] = {};
                }

                //Fill cat Tree
                catTree[rootCat][subCat] = subCatObj;
            }

        };

        var searchCat = function(rootCat, rootCatObj) {
             //check if category has child pages for navigation
             if (typeof rootCatObj['source_page_navigation'] === 'object') {
                for (var subCat in rootCatObj) {
                    var subCatObj = rootCatObj[subCat];

                    buildCatTree(rootCat, subCat, subCatObj);
                }
             }
        };

        for (var rootCat in data) {
            var rootCatObj = data[rootCat];

            searchCat(rootCat, rootCatObj);
        }

        /*
        *
        * Drawing navigation and page info in each catalog defined on page
        *
        * */
        L_CATALOG.each(function () {
            var t = $(this),
                navListCat = t.attr('data-nav'),

                L_CATALOG_LIST = t.find('.' + CATALOG_LIST);

            if (navListCat != '') { //Catalog has data about category
                var targetCat = catTree[navListCat];


                // cast Object to Array of objects
                if(typeof targetCat === 'object'){
                    var targetCatArray = $.map(targetCat, function(k, v) {
                        if(typeof k['index.html'] === 'object') {
                            return [k];
                        }
                    });

                    // sort
                    targetCatArray.sort(function(a, b){
                        return sortByBubbles(a, b)
                                || sortByDate(a, b)
                                || sortByAlpha(a, b);
                    });
                }

                //Collecting nav tree
                if (L_CATALOG_LIST.length === 1 && targetCatArray != undefined) {
                    var navTreeHTML = '',
                        authorName = '';

                    //sortByDate = L_CATALOG_LIST.attr('data-sort') === 'date';

                    //Building navigation HTML
                    var addNavPosition = function (target) {

                        if (target.author != '') {
                            authorName = ' | Автор: ' + target.author + '';
                        } else {
                            authorName = '';
                        }

                        navTreeHTML += '' +
                                '<li class="' + CATALOG_LIST_I + '">' +
                                '<a class="' + CATALOG_LIST_A + '" href="' + target.url + '">' +
                                '<span class="' + CATALOG_LIST_A_TX + '">' + target.title + '</span>' +
                                '<div class="' + CATALOG_LIST_DATE + '">' + target.lastmod + authorName + '</div>';

                        if(parseInt(target.bubbles)) {
                            navTreeHTML +=
                            '<div class="' + CATALOG_LIST_BUBBLES + '">' + target.bubbles + '</div>';
                        }

                        navTreeHTML +=
                                '</a>' +
                                '</li>';
                    };

                    var navListItems = (pageLimit > targetCatArray.length)
                            ? targetCatArray.length
                            : pageLimit;

                    for (var j = 0; j < navListItems; j++) {
                        var targetPage = targetCatArray[j]['index.html'];
                        addNavPosition(targetPage);
                    }

                    //Injecting nav tree
                    L_CATALOG_LIST.html(navTreeHTML);

                    //Go to cat page link
                    if (targetCatArray.length > navListItems) {
                        L_CATALOG_LIST.append(
                            '<li class="' + CATALOG_LIST_I + ' ' + CATALOG_LIST_ALL + '">' +
                                '<a class="' + CATALOG_LIST_ALL_A + '" href="' + targetCat['source_page_navigation']['url'] + '">'+ RES_LINK_TO_ALL + ' ' + targetCatArray.length + '</a>' +
                            '</li>');
                    }

                }

            } else {
                //Display error
                L_CATALOG_LIST.html(RES_NO_DATA);
            }
        })
    };

    $.ajax({
        url:PAGES_DATA,
        dataType:"json",
        error:function () {
            L_CATALOG.html(RES_JSON_ERROR);
        },
        success:function (data) {
            makeSome(data);
        }
    });

});