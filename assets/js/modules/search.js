/*
*
* @author Robert Haritonov (http://rhr.me)
*
* */

//Getting always new version of navigation JSON
var fileTreeJson = 'text!/data/pages_tree.json?' + new Date().getTime();

define([
    'jquery',
    'source/options',
    'sourceLib/autocomplete',
    'sourceLib/modalbox',
    'sourceModules/parseFileTree',
    'sourceModules/globalNav'
    ], function ($, options, autocomplete, modalBox, parseFileTree, globalNav) {
    var json = parseFileTree.getParsedJSON();

    //TODO: make localstorage caching

    //If search enabled
    $(function(){
        var
            L_source_HEADER = $('.source_header'),
            source_HEADER_FOCUS = 'source_header__focus',

            autocompleteData = [],

            searchResultsLabel = "Результаты поиска:",

            activated = false;

        var prepareAutoCompleteData = function() {
            var
                autocomleteDataItem = function (value, data) {
                    this.value = value;
                    this.data = data;
                };

            var pagesData = parseFileTree.getAllPages();
            for (var page in pagesData) {
                var targetPage = pagesData[page]['specFile'];

                var keywords = targetPage.keywords,
                    keywordsPageName = page, //get cat name
                    prepareKeywords = '',
                    rootFolder = page.split('/'),
                    autocompleteValue = targetPage.title,
                    pclass = targetPage.pclass;

                if ( (json[rootFolder[ 1 ]] !== undefined) && (json[rootFolder[ 1 ]]['specFile'] !== undefined) && (options.modulesOptions.search.replacePathBySectionName) ) {
                    keywordsPageName = json[rootFolder[1]]['specFile'].title + ': ' + rootFolder[ rootFolder.length-1 ]; // exclude <b> from search
                }

                if ((keywords !== undefined) && (keywords != '')) {
                    prepareKeywords += ', ' + keywords;
                }

                autocompleteValue += ' (' + keywordsPageName + prepareKeywords + ')';

                autocompleteData[autocompleteData.length] = new autocomleteDataItem(autocompleteValue, targetPage.url);
            }
        };

        var wrapSearchResults = function(results) {
            var list = $("<ul>").addClass("source_catalog_list").addClass("__search-res");
            $.map(results, function(item) {
                var specItem = parseFileTree.getCatAll(item.data).specFile;
                specItem.title = item.value;
                list.append(globalNav.createNavTreeItem(specItem));
            });
            return list;
        };

        var activateAutocomplete = function(target) {
            //initializing jquery.autocomplete
            target.autocomplete({
                "lookup": autocompleteData,
                "autoSelectFirst": true,
                "showAll": function (suggestions) {
                    (new modalBox({
                        "appendTo": ".source_main"
                    }, {
                        "title": searchResultsLabel,
                        "body": wrapSearchResults(suggestions)
                    })).show();
                }
            });

            activated = true;
        };

        require([
            "sourceModules/headerFooter"
        ], function () {

            var L_TARGET_FIELD = $('#livesearch');
            var isNavigation = $('meta[name=source-page-role]').attr('content') === 'navigation';
            var searchOpts = options.modulesOptions.search;
            if (isNavigation  && searchOpts.autoFocusOnNavigationPage ||  searchOpts.autoFocus) {
                setTimeout(function() { //First focus fix
                    L_TARGET_FIELD.focus();
                }, 1);
            }

            //Unblur header on focus
            L_TARGET_FIELD.on({
                'focus':function () {
                    L_source_HEADER.addClass(source_HEADER_FOCUS);

                    if (!activated) {
                        prepareAutoCompleteData();
                        activateAutocomplete(L_TARGET_FIELD);
                    }
                },
                'blur':function () {
                    L_source_HEADER.removeClass(source_HEADER_FOCUS);
                }
            });
        });

    });

});
