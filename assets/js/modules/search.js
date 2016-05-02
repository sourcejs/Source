/*
*
* @author Ilya Mikhailov
*
* */

sourcejs.amd.define([
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
    this.data = [];
    this.options.modulesOptions.search = $.extend (true, {
        classes: {
            searchResult: "__search-res",
            headerFocus: "source_header__focus"
        },
        labels: {
            searchResults: "Search results:",
            showAllButtonText: "Show all search results"
        },
        suggestionsLimit: 4,
        activateOnLoad: true
    }, this.options.modulesOptions.search);

    this.init();
    return this;
};

Search.prototype.constructor = Search;
Search.prototype = module.createInstance();

Search.prototype.init = function() {
    var _this = this;

    this.activated = false;
    this.targetField = $('#livesearch');
    this.header = $('.source_header');

    this.prepareAutoCompleteData();
    this.initSearchField();

    setTimeout(function() {
        _this.targetField.attr('data-initialized', 'true');
    }, 1);
};

Search.prototype.prepareAutoCompleteData = function() {
    this.data = this.data || [];
    if (this.data.length) return;

    var AutocomleteDataItem = function (value, data) {
        this.value = value;
        this.data = data;
    };

    var sort = JSON.parse(localStorage.getItem("source_enabledFilter")) || {"sortDirection": "forward", "sortType": "sortByAlph"};
    var pagesData = parseFileTree.getSortedCatalogsArray("", globalNav.getSortCondition(sort.sortType, sort.sortDirection));

    for (var page in pagesData) {
        if (pagesData.hasOwnProperty(page)) {
            var targetPage = pagesData[page]['specFile'];

            // Skip hidden specs
            if (targetPage.tag && targetPage.tag.indexOf('hidden') > -1) continue;

            var tag = targetPage.tag;
            var pageName = pagesData[page] && pagesData[page]['name']
                ? pagesData[page]['name']
                : ""; //get cat name
            var tags = '';
            var autocompleteValue = targetPage.title;

            if (tag && tag.length) {
                tags += ', ' + tag.join(', ');
            }

            autocompleteValue += ' (' + pageName + tags + ')';
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

function getActivationHandler(ctx) {
    return function() {
        ctx.header.addClass(ctx.activeClass);
        if (!ctx.isActive) {
            ctx.callback();
        }
    };
}

Search.prototype.initSearchField = function() {
    var isNavigation = $('meta[name=source-page-role]').attr('content') === 'navigation';
    var searchOptions = this.options.modulesOptions.search;
    var _this = this;

    if (searchOptions.activateOnLoad) {
        this.activateAutocomplete();
    }

    var autofocusOnNavEnabled = isNavigation && searchOptions.autofocusOnNavigationPage;
    var autofocusOnSpecEnabled = !isNavigation && searchOptions.autofocusOnSpecPage;
    if (autofocusOnNavEnabled || autofocusOnSpecEnabled) {
        setTimeout(function() { //First focus fix
            _this.targetField.focus();
        }, 1);
    }

    var eventContext = {
        header: _this.header,
        activeClass: searchOptions.classes.headerFocus,
        isActive: _this.activated,
        callback: function() {
            return _this.activateAutocomplete();
        }
    };

    //Unblur header on focus
    this.targetField.on({
        'focus': getActivationHandler(eventContext),
        'blur':function () {
            _this.header.removeClass(searchOptions.classes.headerFocus);
        }
    });
    this.targetField.one('keyup', getActivationHandler(eventContext));
};

return new Search();
});
