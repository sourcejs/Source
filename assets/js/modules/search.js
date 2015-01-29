SourceJS.define([
    'jquery',
    'sourceModules/newModule',
    'sourceLib/autocomplete',
    'sourceLib/modalbox',
    'sourceModules/parseFileTree',
    'sourceModules/globalNav',
    'sourceModules/headerFooter'
], function($, Module, Autocomplete, ModalBox, FileTreeParser, Navigation) {
    'use strict';
    
    var search = Module.define('Search');

    if (Module.isExist(search)) return;

    search.init = function() {
        this.initAutoCompleteData();
    };

    search.config = {
        'classes': {
            'searchResult': "__search-res",
            'headerFocus': "source_header__focus"
        },
        'labels': {
            'searchResults': "Search results:",
            'showAllButtonText': "Show all search results"
        },
        'sortOrder': {
            'sortDirection': "forward",
            'sortType': "sortByAlph"
        },
        'suggestionsLimit': 10,
        'autoSelectFirst': true,
        'autoFocus': false,
        'autoFocusOnNavigationPage': true,
        'replacePathBySectionName': false
    };

    // FIXME: remove dependencies from other modules options.
    search.methods.wrapSearchResults = function(results) {
        var classes = [
            this.get('config.modulesOptions.globalNav.classes.catalogList'),
            this.get('config.modulesOptions.search.classes.searchResult'),
            this.get('config.modulesOptions.globalNav.classes.catalog')
        ];
        if (this.get('config.globalNav.showPreviews')) {
            classes.push("__show-preview");
        }
        var list = $('<ul class="' + classes.join(' ') + '">');
        $.map(results, function(item) {
            var specItem = FileTreeParser.getCatAll(item.data).specFile;
            specItem.title = item.value;
            //TODO: NavTreeItem should be implemented as an independent module.
            list.append(Navigation.renderNavTreeItem(specItem));
        });
        return list;
    };

    // FIXME: this method should be simplified
    search.methods.initAutoCompleteData = function() {
        this.data = [];

        var sortOrder = JSON.parse(localStorage.getItem("source_enabledFilter")) || this.get('config.sortOrder');
        var sortCondition = Navigation.getSortCondition(sortOrder.sortType, sortOrder.sortDirection);
        var pagesData = FileTreeParser.getSortedCatalogsArray("", sortCondition);

        // TODO: remove SearchItem. We dont need it.
        var SearchItem = function (value, data) {
            this.value = value;
            this.data = data;
        };

        for (var page in pagesData) {
            if (pagesData.hasOwnProperty(page)) {
                var targetPage = pagesData[page]['specFile'];

                var keywords = targetPage.keywords;
                var keywordsPageName = pagesData[page] && pagesData[page]['name']
                    ? pagesData[page]['name']
                    : ""; // get cat name
                var prepareKeywords = '';
                var rootFolder = page.split('/');
                var autocompleteValue = targetPage.title;
                var json = FileTreeParser.getParsedJSON();

                var isRootSpecExists = json[rootFolder[1]] && json[rootFolder[1]]['specFile'];

                if (isRootSpecExists && this.get('config.replacePathBySectionName')) {
                    keywordsPageName = json[rootFolder[1]]['specFile'].title
                        + ': ' + rootFolder[ rootFolder.length-1 ]; // exclude <b> from search
                }
                if (keywords && keywords !== '') {
                    prepareKeywords += ', ' + keywords;
                }

                autocompleteValue += ' (' + keywordsPageName + prepareKeywords + ')';
                this.data[this.data.length] = new SearchItem(autocompleteValue, targetPage.url);
            }
        }
    };

    // FIXME: should be replaced by set of renderers
    search.methods.initSearchField = function(target) {
        var isNavigation = $('meta[name=source-page-role]').attr('content') === 'navigation';
        var self = this;

        if (isNavigation && this.get('config.autoFocusOnNavigationPage') ||  this.get('config.autoFocus')) {
            // OMG! WTF?!
            // FIXME: REMOVE IT
            setTimeout(function() {
                self.targetField.focus();
            }, 1);
        }

        // Unblur header on focus
        // FIXME: implement it in renderer
        $(target).on({
            'focus':function () {
                // self.header.addClass(searchOptions.classes.headerFocus);
                // TODO: create event for it
                if (!self.activated) {
                    // self.prepareAutoCompleteData();
                    // self.activateAutocomplete();
                }
            },
            'blur':function () {
                // self.header.removeClass(searchOptions.classes.headerFocus);
            }
        });
    };

    // FIXME: should be replaced by set of renderers
    search.methods.initAutocomplete = function(target) {
        var self = this;

        $(target).autocomplete({
            'lookup': this.get("data"),
            'autoSelectFirst': this.get("config.autoSelectFirst"),
            'suggestionsLimit': this.get("config.suggestionsLimit"),
            'labels': {
                "showAllButtonText": this.get("config.labels.showAllButtonText")
            },
            'showAll': function (suggestions) {
                (new ModalBox({
                    "appendTo": ".source_main"
                }, {
                    "title": this.get("config.labels.searchResults"),
                    "body": self.wrapSearchResults(suggestions)
                })).show();
            }
        });
        // TODO: add event "rendered" or smth like this to manage autocomplete activation
    };

    search.templates.body = "<div>Stub</div>";

    search.templates.head = Module.requireTemplate('text!templates/search/stub.html');

    search.renderers.body = function(target) {
        console.log('Body renderer. Stub.');
        return target;
    };

    search.renderers.head = function(target) {
        console.log('head renderer. Stub.');
        return target;
    };

    // FIXME: find suiteable place for it
    var Search = Module.create(search);
    
    var instance = new Search({
        'target': document.getElementById("livesearch"),
        'labels': {
            'searchResults': "Результаты поиска:",
            'showAllButtonText': "Показать всё"
        },
        'plugins': [{
            'name': "MyPluginStub",
            'src': "assets/plugins/myPluginStub"
        }],
        'suggestionsLimit': 4
    });
    
    return instance;
});