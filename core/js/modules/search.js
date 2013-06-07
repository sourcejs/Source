/*
*
* @author Robert Haritonov (http://rhr.me)
*
* */

define([
    'jquery',
    'core/options',
    'lib/jquery.autocomplete',
    'modules/parseFileTree'
    ], function ($, options, autocomplete, parseFileTree) {

    //TODO: make localstorage caching

    //If search enabled
    $(function(){
        var
            L_source_HEADER = $('.source_header'),
            source_HEADER_FOCUS = 'source_header__focus',

            autocompleteData = [],

            activated = false;

        var prepareAutoCompleteData = function() {
            var
                autocomleteDataItem = function (value, data) {
                    this.value = value;
                    this.data = data;
                };

            var pagesData = parseFileTree.getAllPages();

            for (var page in pagesData) {
                var targetPage = pagesData[page]['index.html'];

                var keywords = targetPage.keywords,
                    keywordsPageName = page, //get cat name
                    prepareKeywords = '',

                    autocompleteValue = targetPage.title;

                if (keywords != '' && typeof keywords != 'undefined') {
                    prepareKeywords = ', ' + keywords;
                }

                autocompleteValue += ' (' + keywordsPageName + prepareKeywords + ')';

                autocompleteData[autocompleteData.length] = new autocomleteDataItem(autocompleteValue, targetPage.url);
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
            "modules/headerFooter"
        ], function () {

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