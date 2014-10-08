/*
*
* @author Robert Haritonov (http://rhr.me)
*
* */

define([
    'jquery',
    'sourceModules/module',
    'sourceLib/autocomplete',
    'sourceLib/modalbox',
    'sourceModules/parseFileTree',
    'sourceModules/globalNav',
    'sourceModules/headerFooter'
], function ($, module, autocomplete, ModalBox, parseFileTree, globalNav) {

'use strict';

var Search = function() {
    this.header = $('.source_header');
    this.data = [];
    this.activated = false;
    this.targetField = $('#livesearch');

    this.options.modulesOptions.search = $.extend (true, {
        classes: {
            searchResult: "__search-res",
            headerFocus: "source_header__focus"
        },
        labels: {
            searchResults: "Результаты поиска:",
            showAllButtonText: "Show all search results"
        },
        suggestionsLimit: 4
    }, this.options.modulesOptions.search);

    this.initSearchField();

    return this;
};

Search.prototype = module.createInstance();
Search.prototype.constructor = Search;

Search.prototype.prepareAutoCompleteData = function() {
    var AutocomleteDataItem = function (value, data) {
        this.value = value;
        this.data = data;
    };

    this.data = [];

    var sort = JSON.parse(localStorage.getItem("source_enabledFilter")) || {"sortDirection": "forward", "sortType": "sortByAlph"};
    var pagesData = parseFileTree.getSortedCatalogsArray("", globalNav.getSortCondition(sort.sortType, sort.sortDirection));


    for (var page in pagesData) {
        if (pagesData.hasOwnProperty(page)) {
            var targetPage = pagesData[page]['specFile'];

            var keywords = targetPage.keywords;
            var keywordsPageName = pagesData[page] && pagesData[page]['name']
                ? pagesData[page]['name']
                : ""; //get cat name
            var prepareKeywords = '';
            var rootFolder = page.split('/');
            var autocompleteValue = targetPage.title;
            var searchOptions = this.options.modulesOptions.search;
            var json = parseFileTree.getParsedJSON();


            var isRootSpecExists = json[rootFolder[ 1 ]] && json[rootFolder[ 1 ]]['specFile'];

            if (isRootSpecExists && searchOptions.replacePathBySectionName) {
                keywordsPageName = json[rootFolder[1]]['specFile'].title
                    + ': ' + rootFolder[ rootFolder.length-1 ]; // exclude <b> from search
            }
            if (keywords && keywords !== '') {
                prepareKeywords += ', ' + keywords;
            }

            autocompleteValue += ' (' + keywordsPageName + prepareKeywords + ')';
            this.data[this.data.length] = new AutocomleteDataItem(autocompleteValue, targetPage.url);
        }
    }
};

Search.prototype.wrapSearchResults = function(results) {
    var modulesOptions = this.options.modulesOptions;
    var classes = [
        modulesOptions.globalNav.classes.catalogList,
        modulesOptions.search.classes.searchResult,
        modulesOptions.globalNav.classes.catalog
    ];
    if (modulesOptions.globalNav.showPreviews) {
        classes.push("__show-preview");
    }
    var list = $('<ul class="' + classes.join(' ') + '">');
    $.map(results, function(item) {
        var specItem = parseFileTree.getCatAll(item.data).specFile;
        specItem.title = item.value;
        list.append(globalNav.renderNavTreeItem(specItem));
    });
    return list;
};

Search.prototype.activateAutocomplete = function() {
    var _this = this;
    var searchOptions = this.options.modulesOptions.search;

    this.targetField.autocomplete({
        "lookup": _this.data,
        "autoSelectFirst": true,
        "suggestionsLimit": searchOptions.suggestionsLimit,
        "labels": {
            "showAllButtonText": searchOptions.labels.showAllButtonText
        },
        "showAll": function (suggestions) {
            (new ModalBox({
                "appendTo": ".source_main"
            }, {
                "title": searchOptions.labels.searchResults,
                "body": _this.wrapSearchResults(suggestions)
            })).show();
        }
    });
    this.activated = true;
};

Search.prototype.initSearchField = function() {
    var isNavigation = $('meta[name=source-page-role]').attr('content') === 'navigation';
    var searchOptions = this.options.modulesOptions.search;
    var _this = this;

    if (isNavigation && searchOptions.autoFocusOnNavigationPage ||  searchOptions.autoFocus) {
        setTimeout(function() { //First focus fix
            _this.targetField.focus();
        }, 1);
    }

    //Unblur header on focus
    this.targetField.on({
        'focus':function () {
            _this.header.addClass(searchOptions.classes.headerFocus);
            if (!_this.activated) {
                _this.prepareAutoCompleteData();
                _this.activateAutocomplete();
            }
        },
        'blur':function () {
            _this.header.removeClass(searchOptions.classes.headerFocus);
        }
    });
};

return new Search();
});