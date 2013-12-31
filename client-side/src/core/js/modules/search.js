/*
*
* @author Robert Haritonov (http://rhr.me)
*
* */

//Getting always new version of navigation JSON
var fileTreeJson = 'text!/data/pages_tree.json?' + new Date().getTime();

define([
    'jquery',
    'core/options',
    'lib/jquery.autocomplete',
    'modules/parseFileTree',
    ], function ($, options, autocomplete, parseFileTree) {
    	var json = parseFileTree.getParsedJSON();

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
                var targetPage = pagesData[page]['specFile'];

                var keywords = targetPage.keywords,
                    keywordsPageName = page, //get cat name
                    prepareKeywords = '',
					rootFolder = page.split('/'),
                    autocompleteValue = targetPage.title,
                    pclass = targetPage.pclass;

				if ( (json[rootFolder[1]] !== undefined) && (json[rootFolder[1]]['specFile'] !== undefined) && (options.modulesOptions.search.replacePathBySectionName) ) {
					keywordsPageName = rootFolder[ rootFolder.length-2 ];
					keywordsPageName = '<span style="font-weight: 700">' + json[rootFolder[1]]['specFile'].title + ':</span> ' + keywordsPageName; // exclude <b> from search
				}

                if ((keywords !== undefined) && (keywords != '')) {
                    prepareKeywords += ', ' + keywords;
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