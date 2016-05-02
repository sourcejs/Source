/*
*
* @author Robert Haritonov (http://rhr.me)
*
* */

sourcejs.amd.define([
    "jquery",
    "sourceModules/module",
    "sourceModules/utils",
    "sourceModules/parseFileTree",
    "sourceModules/ntf",
    "sourceLib/lodash"
    ], function($, module, utils, parseFileTree, ntf, _) {
    "use strict";

    /**
     * @Object defaults. It represents preseted options to initialize
     * navigation module. Can be overrided by options.moduleOptions.globalNav.
     */
    var defaults = {
        "filterEnabled": true,
        "useHeaderUrlForNavigation": true,
        "showPreviews": false,
        "sortType": "sortByDate",
        "sortDirection":"forward",
        "delimeter": ",",
        "pageLimit": 999,
        "ignorePages": [],
        "thumbnailName": "thumbnail.png",
        "classes": {
            "catalog": "source_catalog",
            "catalogList": "source_catalog_list",
            "catalogListItem": "source_catalog_list_i",
            "catalogListAll": "source_catalog_all",
            "catalogLinkToAll": "source_a_bl",
            "catalogImageThumbler": "source_catalog_image-tumbler",
            "catalogListLink": "source_catalog_a",
            "catalogListImage": "source_catalog_img",
            "catalogListTitle": "source_catalog_title",
            "catalogListDate": "source_catalog_footer",
            "catalogFilter" : "source_catalog-filter",
            "sourceSubhead" : "source_subhead",
            "catalogText": "source_catalog_tx",
            "showPreview": "__show-preview",
            "updateButton": "source_catalog_update-button"
        },
        "labels": {
            "noDataInCat": "No data in specified nav category",
            "linkToAllSpecs": "All specs",
            "author" : "Author",
            "noDataAttr" : "Data-nav attr not set",
            "loading": "Loading...",
            "hidePreview": "Hide thumbnails",
            "showPreview": "Show thumbnails",
            "updateButton": "Update navigation"
        },
        "templates": {}
    };

    /**
     * @constructor GlobalNav
     *
     * @function GlobalNav. Module constructor.
     * It implements module initialization.
     */
    function GlobalNav() {
        var _this = this;
        this.options.modulesOptions.globalNav = $.extend(true, defaults,
            this.options.modulesOptions.globalNav,
            JSON.parse(localStorage.getItem("source_enabledFilter")) || {}
        );
        this.initTemplates();
        $(function() {
            _this.init();
        });
    }

    GlobalNav.prototype = module.createInstance();
    GlobalNav.prototype.constructor = GlobalNav;

    /**
     * @returns Object templates. Contains basic navigation templates.
     * It uses lo-dash template function.
     */
    GlobalNav.prototype.initTemplates = function() {
        this.templates = $.extend(true, {
            catalogList: _.template([
                '<ul class="<%= classes.catalogList %>">',
                    '<img src="/source/assets/i/process.gif" alt="<%= labels.loading %>"/>',
                '</ul>'
            ].join("")),

            catalogHeader: _.template('<h2 class="<%= classes.catalogListTitle %>"> <%= catalogMeta.title %></h2>'),

            catalogMeta: _.template('<div class="<%= classes.catalogText %>"><%= catalogMeta.info %></div>'),

            catalogLinkToAll: _.template([
                '<li class="<%= classes.catalogListItem %> <%= classes.catalogListAll %>">',
                    '<a class="<%= classes.catalogLinkToAll %>" href="<%= url %>"><%= labels.linkToAllSpecs %> <%= length %> </a>',
                '</li>'
            ].join("")),

            navigationListItem: _.template([
                '<li class="<%= classes.catalogListItem %>">',
                    '<a class="<%= classes.catalogListLink %> source_a_g" href="#">',
                        '<span class="<%= classes.catalogListTitle %>"></span>',
                        '<div class="<%= classes.catalogListDate %>"></div>',
                    '</a>',
                '</li>'
            ].join("")),

            catalogFilter: _.template('<div class="<%= classes.catalogFilter %>"></div>'),

            togglePreviewLink: _.template('<button class="<%= classes.catalogImageThumbler %>"><%= togglePreviewLabel %></button>'),
            updateButton: _.template('<button class="<%= classes.updateButton %>"><%= labels.updateButton %></button>'),

            sortList: _.template([
                '<ul class="source_sort-list">',
                    '<li class="source_sort-list_li">Sort by&nbsp;</li>',
                    '<li class="source_sort-list_li"><a class="source_sort-list_a" id="sortByAlph" href="#sort=alph">alphabet</a></li>',
                    '<li class="source_sort-list_li">&nbsp;or&nbsp;</li>',
                    '<li class="source_sort-list_li"><a class="source_sort-list_a" id="sortByDate" href="#sort=date">date</a></li>',
                '</ul>'
            ].join(""))
        }, this.options.modulesOptions.globalNav.templates);
    };

    /**
     * @method init. This method implements initial module definition.
     */
    GlobalNav.prototype.init = function () {
        var navOptions = this.options.modulesOptions.globalNav;
        this.catalog = $("." + navOptions.classes.catalog);
        this.renderNavigation();

        if (this.options.modulesOptions.globalNav.filterEnabled) {
            this.initCatalogFilter();
        }
    };

    /**
     * @private
     * @method skipSpec. Filtering by specified catalogue
     *
     * @param {String|Array} navListCat catalogue type
     * @param {Object} obj - object to filter
     *
     * @returns {Boolean} true if spec shoud be skipped.
     */
    var skipSpec = function(navListCat, obj) {
        obj = obj || {};

        // obj["cat"] is an array; if cat has needed value
        var isSingleTag = !!obj["tag"] && typeof(navListCat) === "string";
        var inArray = isSingleTag
            ? !!~obj["tag"].indexOf(navListCat)
            : !!obj["tag"] && _.reduce(navListCat, function(inArray, item) {
                return inArray && !!~obj['tag'].indexOf(item);
            }, true);
        // without-cat mode, showing all specs without cat field in info.json defined or
        var isWithoutCat = navListCat === "without-tag" && (!obj["tag"] || obj["tag"].length === 0);
        return !inArray && !isWithoutCat;
    };

    /**
     * @private
     * @method isHidden. It helps to filter hidden specs.
     *
     * @param {Object} obj - spec to check.
     *
     * @returns {Boolean} true if spec is hidden.
     */
    var isHidden = function(obj) {
        return !!obj["tag"] && !!~obj["tag"].indexOf("hidden");
    };

    /**
     * @method initCatalog - initialize catalog DomElement
     *
     * @param {Object} catalog - Catalog DomElement
     * @param {Object} catalogMeta - additional catalog information.
     * @param {Boolean} specifCatAndDirDefined - boolean flag, which defines if some cat and dir are defined
     */
    GlobalNav.prototype.initCatalog = function(catalog, catalogMeta, specifCatAndDirDefined) {
        var config = this.options.modulesOptions.globalNav;
        var classes = config.classes;
        if (catalog.find("." + classes.catalogList).length === 0) {
            catalog.append(this.templates.catalogList(config));
        }
        if (specifCatAndDirDefined || !catalogMeta) {
            return;
        }
        var isHeaderAdded = (
            catalog.find("." + classes.catalogListTitle).length !== 0 ||
            catalog.children("h2").length !== 0
        );
        var isInfoAdded = (
            catalog.find("." + classes.catalogText).length !== 0 ||
            catalog.children("p").length !== 0
        );

        if (catalogMeta && !isHeaderAdded) {
            catalog.prepend(this.templates.catalogHeader({"classes": classes, "catalogMeta": catalogMeta}));
        }
        if (catalogMeta && catalogMeta.info && $.trim(catalogMeta.info) !== "" && !isInfoAdded) {
            catalog
                .children("." + classes.catalogListTitle)
                .first()
                .after(this.templates.catalogMeta({"classes": classes, "catalogMeta": catalogMeta}));
        }
    };

    /**
     * @method renderNavigation. Drawing navigation and page info in each catalog defined on page.
     *
     * @param {String} [sortType] - type of sorting
     * @param {String} [sortDirection] - ASC || DESC
     */
    GlobalNav.prototype.renderNavigation = function (sortType, sortDirection) {
        var _this = this;
        var navOptions = this.options.modulesOptions.globalNav;
        var classes = navOptions.classes;
        var labels = navOptions.labels;

        sortType = sortType || navOptions.sortType;
        sortDirection = sortDirection || navOptions.sortDirection;

        this.catalog.each(function () {
            var catalog = $(this);
            var navListDir = _this.processDefinedTargetCatalogue(catalog.attr("data-nav"));
            var navListCat = catalog.attr("data-tag");

            // Catalog has no data about category
            var targetCatalog = parseFileTree.getCurrentCatalogSpec(navListDir) || {};

            _this.initCatalog(catalog, targetCatalog, !!navListDir && !!navListCat);

            if (navListDir && !navListDir.length) {
                // Display error
                catalog.find("." + classes.catalogList).html(labels.noDataAttr);
                return;
            }

            var targetData = parseFileTree.getSortedCatalogsArray(navListDir, _this.getSortCondition(sortType, sortDirection));

            _this.renderNavigationList(catalog, targetData);
        });

        // Scroll to hash after render
        var navHash = utils.parseNavHash();
        utils.scrollToSection(navHash);
    };

    /**
     * @method renderNavigationList. It draws navigation list into catalog.
     *
     * @param {Object} catalog - DomElement to fill
     * @param {Object} data - content
     */
    GlobalNav.prototype.renderNavigationList = function(catalog, data) {
        var navOptions = this.options.modulesOptions.globalNav;
        var delimeter = navOptions.delimeter;
        var target = catalog.find("." + navOptions.classes.catalogList);
        var navListDir = catalog.attr("data-nav");
        var navListCat = catalog.attr("data-tag");
        navListCat = typeof(navListCat) === "string" ? navListCat.split(' ').join('') : navListCat;
        navListCat = navListCat && !!~navListCat.indexOf(delimeter) ? navListCat.split(delimeter) : navListCat;
        var catalogHeaderURL = catalog.find("." + navOptions.classes.catalogListTitle + '>a').attr('href');

        var filter = function(spec) {
            var isInIgnoreList = !spec || !spec.title || !spec.url || !!~$.inArray(spec.title, navOptions.ignorePages);
            var isFiltered = !!navListDir && !!navListCat && skipSpec(navListCat, spec) || isHidden(spec);
            return isInIgnoreList || isFiltered ? false : true;
        };

        if (!data || !data.length) {
            target.html(navOptions.labels.noDataInCat);
            return;
        }

        if(target && target.length === 1) {
            var url = catalogHeaderURL && catalogHeaderURL.length && navOptions.useHeaderUrlForNavigation
                ? catalogHeaderURL : navListDir;
            var specs = _.reduce(data, function(result, item) {
                filter(item["specFile"]) && result.push(item);
                return result;
            }, []);
            target.html(this.getNavigationItemsList(specs, url));
        }
    };

    /**
     * @methor getNavigationItemsList. It creates the list of navigation items.
     *
     * @param [Array] specifications - list of items to create nav items.
     * @param {String} catalogUrl - URL to catalog
     * @param [function] isValid - callback to check if spec is valid.
     *
     * @returns {Object} document fragment which contains list of navItems.
     */
    GlobalNav.prototype.getNavigationItemsList = function(specifications, catalogUrl) {
        // temporary container to hold navigation items.
        var navigationItemsList = document.createDocumentFragment();
        var self = this;
        var navOptions = this.options.modulesOptions.globalNav;
        var pageLimit = navOptions.pageLimit;
        var classes = navOptions.classes;
        var labels = navOptions.labels;
        var lengthLimit = pageLimit > specifications.length
            ? specifications.length
            : pageLimit;

        var specsToShow = specifications.slice(0, lengthLimit);
        _.map(specsToShow, function(item) {
            navigationItemsList.appendChild(self.renderNavTreeItem(item["specFile"]).get(0));
        });

        // Go to cat page link
        if (specifications.length > lengthLimit) {
            navigationItemsList.appendChild(
                $(this.templates.catalogLinkToAll({
                    classes: classes,
                    labels: labels,
                    url: catalogUrl,
                    length: specifications.length
                })).get(0)
            );
        }

        return navigationItemsList;
    };

    /**
     * @method renderNavTreeItem. Returns single navigation tree item. It uses item template for it.
     *
     * @param {Object} itemData - data of single list item.
     *
     * @returns {Object} result - rendering result
     */
    GlobalNav.prototype.renderNavTreeItem = function(itemData) {
        if (!itemData || !itemData.url || !itemData.title) return;

        var navConfig = this.options.modulesOptions.globalNav;
        var classes = navConfig.classes;
        var lastMod = itemData.lastmod || '';
        var author = itemData.author ? navConfig.labels.author + ": " + itemData.author : '';
        var metaInfo = '';

        var addToMeta = function(data){
            if (data === '') return;

            if (metaInfo === '') {
                metaInfo = data;
            } else {
                metaInfo += ' | ' + data;
            }
        };

        addToMeta(lastMod);
        addToMeta(author);

        if (metaInfo === '') metaInfo = '&nbsp;';

        // fixing relative path due to server settings
        var itemDataUrl = itemData.url.charAt(0) === "/" ? itemData.url : "/" + itemData.url;
        var imageUrl = itemData.thumbnail;
        if (!this.renderNavTreeItem.template) {
            this.renderNavTreeItem.template = this.templates.navigationListItem(navConfig);
        }

        var result = $(this.renderNavTreeItem.template).clone(true);
        result.find("." + classes.catalogListLink.split(" ").join(".")).attr("href", itemDataUrl);
        if (imageUrl) {
            result.find("." + classes.catalogListLink)
                .prepend('<img class="'+ classes.catalogListImage +'" src="'+ imageUrl +'">');
        }
        result.find("." + classes.catalogListTitle).html(itemData.title);
        result.find("." + classes.catalogListDate).html(metaInfo);

        return result;
    };

    /**
     * @method initCatalogFilter - function that initializes filters.
     * Rendering is also calls from it.
     */
    GlobalNav.prototype.initCatalogFilter = function() {
        var classes = this.options.modulesOptions.globalNav.classes;
        var $subhead = $("." + classes.sourceSubhead);
        var $catalog = $("." + classes.catalog);
        if (!$subhead.length || !$catalog.length) return;

        this.renderFilters($subhead);
    };

    /**
     * @method renderFilters. It renders filters layout.
     *
     * @param {Object} filtersTarget - dom element which is going to be
     * container for rendering.
     */
    GlobalNav.prototype.renderFilters = function(filtersTarget) {
        var classes = this.options.modulesOptions.globalNav.classes;
        if (!filtersTarget.find("." + classes.catalogFilter).length) {
            filtersTarget.prepend(this.templates.catalogFilter({"classes": classes}));
        }
        this.renderSortFilters();
        this.renderPreviewsToggler();
        this.updateButton();
    };

    /**
     * @method renderPreviewsToggler. It draws preview toggler.
     */
    GlobalNav.prototype.renderPreviewsToggler = function() {
        var classes = this.options.modulesOptions.globalNav.classes;
        var labels = this.options.modulesOptions.globalNav.labels;
        var showPreviews = this.options.modulesOptions.globalNav.previews;
        var initPreviewValue = localStorage.getItem( "source_showPreviews") || showPreviews;
        var $filter = $("." + classes.catalogFilter);
        var catalog = this.catalog;

        if (initPreviewValue === "true") { // initPreviewValue is string, not boolean
            catalog.addClass(classes.showPreview);
            $filter.append(this.templates.togglePreviewLink({"classes": classes, "togglePreviewLabel": labels.hidePreview}));
        } else {
            $filter.append(this.templates.togglePreviewLink({"classes": classes, "togglePreviewLabel": labels.showPreview}));
        }

        $(document).on("click", "." + classes.catalogImageThumbler, function(e) {
            e.preventDefault();
            var showPreviews = localStorage.getItem( "source_showPreviews");
            var $this = $(this);
            var previewText;

            if (showPreviews === "true") { // string
                previewText = labels.showPreview;
                localStorage.setItem("source_showPreviews" , false);
            } else {
                previewText = labels.hidePreview;
                localStorage.setItem("source_showPreviews", true);
            }

            $this.text(previewText);
            catalog.toggleClass(classes.showPreview);
        });
    };

    /**
     * @method updateButton. It draws link that allows to trigger page update.
     */
    GlobalNav.prototype.updateButton = function() {
        var classes = this.options.modulesOptions.globalNav.classes;
        var labels = this.options.modulesOptions.globalNav.labels;
        var $filter = $("." + classes.catalogFilter);

        $filter.append(
            ' | ',
            this.templates.updateButton({
                classes: classes,
                labels: labels
            }
        ));

        $(document).on("click", "." + classes.updateButton, function(e) {
            e.preventDefault();

            $.get('/api/updateFileTree')
                .done(function (data) {
                    if (utils.isDevelopmentMode()) console.log('Navigation update done: ', data.message);

                    location.reload();
                })
                .fail(function (err) {
                    console.log('Error updating navigation: ', err);

                    ntf.alert('Error updating navigation');
                });
        });
    };


    /**
     * @method renderSortFilters. It draws Sort Filters layout.
     */
    GlobalNav.prototype.renderSortFilters = function() {
        var defaultSort = this.options.modulesOptions.globalNav.sortType;
        var $filterWrapper = $("." + this.options.modulesOptions.globalNav.classes.catalogFilter);
        var enabledFilter = JSON.parse(localStorage.getItem("source_enabledFilter")) || {"sortType":defaultSort,"sortDirection":"forward"};
        var nav = this.templates.sortList();
        var _this = this;

        $filterWrapper.append(nav);

        var $activeFilter = $("#" + enabledFilter.sortType);
        $activeFilter.parent().addClass("__active");

        if (enabledFilter.sortDirection === "forward") {
            $activeFilter.parent().addClass("__forward");
        }

        var updateView = function(el) {
            var $this = el;
            var sortType = $this.attr("id");
            var sortDirection = "backward";

            $(".source_sort-list_li").removeClass("__active");
            $this.parent()
                .addClass("__active")
                .toggleClass("__forward");

            if ( $this.parent().hasClass("__forward") ) {
                sortDirection = "forward";
            }

            enabledFilter.sortType = sortType;
            enabledFilter.sortDirection = sortDirection;
            localStorage.setItem("source_enabledFilter", JSON.stringify(enabledFilter));
            _this.renderNavigation(sortType, sortDirection);
        };

        $(document).on("click", ".source_sort-list_a", function() {
            updateView($(this));
        });
    };

    /**
     * @method getSortCondition. It defines current sorting property and order.
     *
     * @param {String} type - on of predefined sort types.
     * @param {String} direction - ASC or DESC sort odrer
     *
     * @returns [Function] sortingCallback - function to sort items.
     */
    GlobalNav.prototype.getSortCondition = function(type, direction) {
        var multiplexer = direction === "forward" ? 1 : -1;
        if (type === "sortByAlph") {
            return function sortByAlph(a, b) {
                if (!a["specFile"].title || !b["specFile"].title) return 0;
                a = a["specFile"].title.replace(/(^\s+|\s+$)/g, "");
                b = b["specFile"].title.replace(/(^\s+|\s+$)/g, "");

                if (a === b) return 0;
                return multiplexer * ((a > b) ? 1 : -1);
            };
        }
        // type === "sortByDate", this is default one
        return function sortByDate(a, b) {
            a = parseInt(a["specFile"].lastmodSec, 10);
            b = parseInt(b["specFile"].lastmodSec, 10);
            if(a === b) return 0;
            return multiplexer * ((a > b) ? -1 : 1);
        };
    };

    GlobalNav.prototype.processDefinedTargetCatalogue = function(targetCatalogue) {
        var endTarget = targetCatalogue;
        var relativeRegExt = new RegExp(/^.\//);

        // If relative with `./`
        if (relativeRegExt.test(endTarget)) {
            endTarget = endTarget.replace(relativeRegExt, utils.getPathToPage() + '/');
        }

        return endTarget;
    };

    return new GlobalNav();
});
