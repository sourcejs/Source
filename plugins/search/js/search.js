/*
*
* @author Robert Haritonov (http://rhr.me)
*
* */

define([
    'jquery',
    "modules/css",
    'core/options',
    'plugins/lib/jquery.autocomplete',
    'text!/data/pages_tree.json',
    "text!plugins/search/css/search.css"
    ], function ($, css, options, autocomplete, json) {

    //TODO: make localstorage caching
    //TODO: combine plugin with globalNav

    //If search enabled
    $(function(){
        new css('search/css/search.css');

        var
            L_source_HEADER = $('.source_header'),
            source_HEADER_FOCUS = 'source_header__focus',

            autocompleteData = [],

            activated = false;

        var prepareAutoCompleteData = function() {
            var data = $.parseJSON(json.toString());

            var
                autocomleteDataItem = function (value, data) {
                    this.value = value;
                    this.data = data;
                };

            //for filling autocompleteData
            var addAuctocompleteData = function(subCat, targetSubCat) {
                var targetPage = targetSubCat['index.html'];

                //check if category has child pages
                if (typeof targetSubCat['source_page_navigation'] != 'object') {

                    //Check if we are looking for right page object
                    if (typeof targetPage === 'object') {
                        var keywords = targetPage.keywords,
                                keywordsPageName = subCat, //get cat name
                                prepareKeywords = '',

                                autocompleteValue = targetPage.title;

                        if (keywords != '' && typeof keywords != 'undefined') {
                            prepareKeywords = ', ' + keywords;
                        }

                        autocompleteValue += ' (' + keywordsPageName + prepareKeywords + ')';

                        autocompleteData[autocompleteData.length] = new autocomleteDataItem(autocompleteValue, targetPage.url);
                    }

                } else {
                    searchCat(targetSubCat);
                }
            };

            var searchCat = function(targetCat) {
                for (var subCat in targetCat) {
                    var targetSubCat = targetCat[subCat];

                    addAuctocompleteData(subCat, targetSubCat);
                }
            };

            for (var cat in data) {
                var targetCat = data[cat];

                searchCat(targetCat);
            }
        };

        var activateAutocomplete = function(target) {
            //initializing jquery.autocomplete
            target.autocomplete({
                lookup:autocompleteData,
                autoSelectFirst:true,
                onSelect:function (suggestion) {
                    window.location = suggestion.data;
                }
            });

            activated = true;
        };

        require([
            "text!plugins/search/templates/search.inc.html",
            "modules/headerFooter"
        ], function (html) {

            $("." + options.headerClass).find("." + options.colMain).append(html);

            var L_TARGET_FIELD = $('#livesearch');

            if ( $('meta[name=source-page-role]').attr('content') === 'navigation' ) {
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