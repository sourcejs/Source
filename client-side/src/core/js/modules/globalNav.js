/*
*
* @author Robert Haritonov (http://rhr.me)
*
* */

define([
    'jquery',
    'modules/module',
    'modules/utils',
    'modules/parseFileTree'
    ], function($, module, utils, parseFileTree) {

    function GlobalNav() {
        var _this = this;

        this.options.modulesOptions.globalNav = $.extend(true, {
            CATALOG : 'source_catalog',
            CATALOG_LIST : 'source_catalog_list',
            CATALOG_LIST_I : 'source_catalog_list_i',
                CATALOG_LIST_I_PREVIEW_NAME : 'thumbnail.png',
            CATALOG_LIST_ALL : 'source_catalog_all',
                CATALOG_LIST_ALL_A : 'source_a_bl',

            CATALOG_IMG_TUMBLER: 'catalog-image-tumbler',

            CATALOG_LIST_A : 'source_catalog_a source_a_g',
            CATALOG_LIST_A_IMG : 'source_catalog_img',
            CATALOG_LIST_A_TX : 'source_catalog_title',
            CATALOG_LIST_DATE : 'source_catalog_footer',
            CATALOG_LIST_BUBBLES : 'source_bubble',

            RES_LINK_TO_ALL : 'All',
            RES_AUTHOR : 'Author',
            RES_NO_DATA_ATTR : 'Data-nav attr not set',
            RES_NO_CATALOG : 'Specified catalog is empty or does not exist',
            RES_NO_CATALOG_INFO : 'Specified catalog does not have data about it',

            pageLimit : 999
        }, this.options.modulesOptions.globalNav);

        $(function(){
            _this.init();
        });
    }

    GlobalNav.prototype = module.createInstance();
    GlobalNav.prototype.constructor = GlobalNav;

    GlobalNav.prototype.init = function () {
        this.drawNavigation();
        this.drawToggler();
        this.hideImgWithError();

        if (window.location.pathname == "/base/" ||
            window.location.pathname == "/project/" ||
            window.location.pathname == "/mob/") {
            this.initStatusFilter();
            this.drawFilters();
        }
    };

    //Drawing navigation and page info in each catalog defined on page
    GlobalNav.prototype.drawNavigation = function (sortType) {
        var _this = this,
            L_CATALOG = $('.' + this.options.modulesOptions.globalNav.CATALOG),
            CATALOG_LIST = this.options.modulesOptions.globalNav.CATALOG_LIST,
            CATALOG_LIST_I = this.options.modulesOptions.globalNav.CATALOG_LIST_I,
                CATALOG_LIST_I_PREVIEW_NAME = this.options.modulesOptions.globalNav.CATALOG_LIST_I_PREVIEW_NAME,

            CATALOG_LIST_ALL = this.options.modulesOptions.globalNav.CATALOG_LIST_ALL,
                CATALOG_LIST_ALL_A = this.options.modulesOptions.globalNav.CATALOG_LIST_ALL_A,

            CATALOG_LIST_A = this.options.modulesOptions.globalNav.CATALOG_LIST_A,
                CATALOG_LIST_A_IMG = this.options.modulesOptions.globalNav.CATALOG_LIST_A_IMG,
                CATALOG_LIST_A_TX = this.options.modulesOptions.globalNav.CATALOG_LIST_A_TX,

            CATALOG_LIST_DATE = this.options.modulesOptions.globalNav.CATALOG_LIST_DATE,
            CATALOG_LIST_BUBBLES = this.options.modulesOptions.globalNav.CATALOG_LIST_BUBBLES,
            RES_LINK_TO_ALL = this.options.modulesOptions.globalNav.RES_LINK_TO_ALL,
            RES_AUTHOR = this.options.modulesOptions.globalNav.RES_AUTHOR,
            RES_NO_DATA_ATTR = this.options.modulesOptions.globalNav.RES_NO_DATA_ATTR,
            RES_NO_CATALOG = this.options.modulesOptions.globalNav.RES_NO_CATALOG,
            RES_NO_CATALOG_INFO = this.options.modulesOptions.globalNav.RES_NO_CATALOG_INFO,

            pageLimit = this.options.modulesOptions.globalNav.pageLimit;
            sortType = sortType || this.options.modulesOptions.globalNav.sortType || 'sortByDate';
            ignorePages = this.options.modulesOptions.globalNav.ignorePages || [];

        //TODO: refactor this module and write tests
        L_CATALOG.each(function () {
            var sourceCat = $(this),
                navListDir = sourceCat.attr('data-nav'),
                navListCat = sourceCat.attr('data-cat'),
                specifCatAndDirDefined = typeof navListDir !== 'undefined' && typeof navListCat !== 'undefined';

            //Filtering by specified catalogue
            var skipSpec = function(currentObj){
                var obj = currentObj,
                    response = true; // skip by default

                //obj['cat'] is an array
                //if cat has needed value
                if (typeof obj['cat'] !== 'undefined' && obj['cat'].indexOf(navListCat) > -1) {
                    response = false;

                //without-cat mode, showing all specs without cat field in info.json defined or
                } else if ( navListCat === 'without-cat' && (typeof obj['cat'] === 'undefined' || obj['cat'].length === 0) ) {

                    response = false;
                }

                return response;
            };

            //Filtering hidden specs
            var isHidden = function(currentObj){
                var obj = currentObj,
                    response = false; // skip by default

                //obj['cat'] is an array
                if (typeof obj['cat'] !== 'undefined' && obj['cat'].indexOf("hidden") > -1 ) {
                    response = true;
                }

                return response;
            };

            if ( (navListDir !== undefined) && (navListDir != '') ) { //Catalog has data about category

                var targetCat = parseFileTree.getCatAll(navListDir),
                	catObj;

				if (targetCat === undefined) return;

				if ( !sourceCat.find('.source_catalog_list').length ) {
					sourceCat.append('<ul class="source_catalog_list"><img src="/core/i/process.gif" alt="Загрузка..."/></ul>');
				}

                //Looking for catalogue info
				if (typeof targetCat[ navListDir + '/specFile' ] === 'object') {
					catObj = targetCat[ navListDir + '/specFile' ];
				} else if ( typeof targetCat[ 'specFile' ] === 'object' ) {
					if (!!targetCat[ 'specFile' ][ 'specFile' ]) {
						catObj = targetCat[ 'specFile' ][ 'specFile' ];
					} else {
						catObj = targetCat[ 'specFile' ];
					}
				}

				if (typeof catObj === 'object' && !specifCatAndDirDefined) {

					if ( (!sourceCat.find('.source_catalog_title').length) && (catObj.title !== undefined) ) {
						sourceCat.prepend('<h2 class="source_catalog_title">' + catObj.title + '</h2>')
					}

					if ( (!sourceCat.find('.source_catalog_tx').length) && (catObj.info !== undefined) && ( $.trim(catObj.info) !== '' )) {
						sourceCat
							.children('.source_catalog_title')
							.first()
								.after('<div class="source_catalog_tx">' + catObj.info + '</div>')
					}

				} else {
					console.log(RES_NO_CATALOG_INFO);
				}

				var L_CATALOG_LIST = sourceCat.find('.' + CATALOG_LIST);

                // cast Object to Array of objects
                if (typeof targetCat === 'object'){
                    var targetCatArray = $.map(targetCat, function(k, v) {
                        if(typeof k['specFile'] === 'object') {
                            return [k];
                        }
                    });

                    // sort
                    targetCatArray.sort(function(a, b){
                    	if (sortType == 'sortByDate') {
                    		return _this.sortByDate(a, b)
                    	} else if (sortType == 'sortByAlpha') {
                    		return _this.sortByAlpha(a, b);
                    	} else {
							return _this.sortByDate(a, b)
									|| _this.sortByAlpha(a, b);
                    	}
                    });
                }

                //Collecting nav tree
                if (L_CATALOG_LIST.length === 1 && targetCatArray != undefined) {

                    var navTreeHTML = '',
                        authorName = '';

                    //Building navigation HTML
                    var addNavPosition = function (target) {

                        if (typeof target.author === 'undefined') {
                            authorName = '';
                        } else {
                            authorName = target.author;
                        }

                        //fixing relative path due to server settings
                        var targetUrl = target.url;
                        if(targetUrl.charAt(0) !== '/')
                            targetUrl = '/' + targetUrl;

                        navTreeHTML += '' +
                                '<li class="' + CATALOG_LIST_I + '" data-title="' + target.title + '" data-date="' + target.lastmodSec + '">' +
                                '<img class="' + CATALOG_LIST_A_IMG + '" src="' + targetUrl + '/' + CATALOG_LIST_I_PREVIEW_NAME + '" >' +
                                '<a class="' + CATALOG_LIST_A + '" href="' + targetUrl + '">' +
                                '<span class="' + CATALOG_LIST_A_TX + '">' + target.title + '</span>' +
                                '<div class="' + CATALOG_LIST_DATE + '">' + authorName + '</div>';

                        // TODO: move to plugins
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
                        var targetPage = targetCatArray[j]['specFile'];

                        //Ignore page list
                        if ( $.inArray(targetPage.title, ignorePages) !== -1 ) {
                        	continue;
                        }

                        //Undefined title
                        if (targetPage === undefined || targetPage.title === undefined) {
                        	continue;
                        }

                        //Skip spec if we're filtering it by specific cat
                        if (specifCatAndDirDefined && skipSpec(targetCatArray[j]['specFile']) || isHidden(targetCatArray[j]['specFile']) ) {
                            continue; //skip
                        }

                        addNavPosition(targetPage);
                    }



                    //Injecting nav tree
                    L_CATALOG_LIST.html(navTreeHTML);

                    //Go to cat page link
                    if (targetCatArray.length > navListItems) {
                        L_CATALOG_LIST.append(
                            '<li class="' + CATALOG_LIST_I + ' ' + CATALOG_LIST_ALL + '">' +
                                '<a class="' + CATALOG_LIST_ALL_A + '" href="' + navListDir + '">'+ RES_LINK_TO_ALL + ' ' + targetCatArray.length + '</a>' +
                            '</li>');
                    }

                }

                if (targetCat === undefined) {
                    L_CATALOG_LIST.html(RES_NO_CATALOG);
                }

            } else {

            	if (navListDir !== undefined) {
					//Display error
					L_CATALOG_LIST.html(RES_NO_DATA_ATTR);
            	}
            }

        });
    };

    GlobalNav.prototype.drawToggler = function() {
        var _this = this,
            L_CATALOG = $('.' + _this.options.modulesOptions.globalNav.CATALOG),
            CATALOG_IMG_TUMBLER = _this.options.modulesOptions.globalNav.CATALOG_IMG_TUMBLER;

        L_CATALOG.filter('[data-nav*="base"][data-preview!="disable"],[data-nav*="project"][data-preview!="disable"]').each(function(){

            var $this = $(this),
                /* for each type of data-nav own localStorage */
                _tumblerMode = $this.attr('data-nav').substr(1),
                tumblerMode = localStorage.getItem( _tumblerMode + 'TumblerMode');

            if ( tumblerMode && tumblerMode == 'showPreview' ) {

                $this
                    .addClass('__show-preview')
                    .prepend('<a class="' + CATALOG_IMG_TUMBLER + '" href="#">Скрыть превьюшки</a>');

            } else if ( !tumblerMode && _tumblerMode == 'base' ) {

                // for base spec show preview by default
                $this
                    .addClass('__show-preview')
                    .prepend('<a class="' + CATALOG_IMG_TUMBLER + '" href="#">Скрыть превьюшки</a>');

            } else {

                $this.prepend('<a class="' + CATALOG_IMG_TUMBLER + '" href="#">Показать превьюшки</a>');
            }

        });

        $(document).on('click', '.' + CATALOG_IMG_TUMBLER, function(e) {
            e.preventDefault();

            var $this = $(this),
                tumblerText = $this.text(),
                _tumblerMode = $this.parent().attr('data-nav').substr(1);

            if ( tumblerText == 'Показать превьюшки' ) {
                tumblerText = 'Скрыть превьюшки';
                localStorage.setItem( _tumblerMode + "TumblerMode", "showPreview");
            } else {
                tumblerText = 'Показать превьюшки';
                localStorage.setItem( _tumblerMode + "TumblerMode", "hidePreview");
            }

            $this
                .text(tumblerText)
                .parent().toggleClass('__show-preview');

        });
    };

    GlobalNav.prototype.hideImgWithError = function(){
        var CATALOG_LIST_A_IMG = this.options.modulesOptions.globalNav.CATALOG_LIST_A_IMG;

        //check valid all img
        $('.' + CATALOG_LIST_A_IMG).each(function(){
            this.onerror = function(){
                $(this).remove();
            };
        });
    };

    GlobalNav.prototype.sortByDate = function (a, b) {
        a = parseInt(a['specFile'].lastmodSec);
        b = parseInt(b['specFile'].lastmodSec);

        if(a == b) return 0;
        else {
            return (a > b) ? -1 : 1;
        }
    };

    GlobalNav.prototype.sortByAlpha = function (a, b) {
        a = a['specFile'].title.replace(/(^\s+|\s+$)/g,'');
        b = b['specFile'].title.replace(/(^\s+|\s+$)/g,'');

        if(a == b) return 0;
        else {
            return (a > b) ? 1 : -1;
        }
    };

    // Filter specs by dev status
    GlobalNav.prototype.initStatusFilter = function() {
        var $subhead = $('.source_subhead'),
            enabledStatus = JSON.parse(localStorage.getItem('enabledStatus')) || {},
            nav = '<div class="source_subhead_filter-w">' +
                      '<label><input id="dev" class="source_status-toggler_i" type="checkbox">dev</label>' +
                      '<label><input id="exp" class="source_status-toggler_i" type="checkbox">exp</label>' +
                      '<label><input id="rec" class="source_status-toggler_i" type="checkbox">rec</label>' +
                      '<label><input id="ready" class="source_status-toggler_i" type="checkbox">ready</label>' +
                      '<label><input id="rev" class="source_status-toggler_i" type="checkbox">rev</label>' +
                      '<a href="# id="dev"><img class="source_status-toggler_img" src="/data/node/user/node_modules/sourcejs-spec-status/i/dev.png"></a>'+
                      '<a href="# id="exp"><img class="source_status-toggler_img" src="/data/node/user/node_modules/sourcejs-spec-status/i/exp.png"></a>'+
                      '<a href="# id="rec"><img class="source_status-toggler_img" src="/data/node/user/node_modules/sourcejs-spec-status/i/rec.png"></a>'+
                      '<a href="# id="ready"><img class="source_status-toggler_img" src="/data/node/user/node_modules/sourcejs-spec-status/i/ready.png"></a>'+
                      '<a href="# id="rev"><img class="source_status-toggler_img" src="/data/node/user/node_modules/sourcejs-spec-status/i/rev.png"></a>'+
                  '</div>';

        $subhead.prepend(nav);

        var initEnabledStatusSpec = function() {
            var $catalogItems = $('.source_catalog_list_i');

            if ($.isEmptyObject(enabledStatus)) {
                $catalogItems.show();
                return;
            }

            $catalogItems.hide();

            $.each(enabledStatus, function(statusId) {
                $('.__' + statusId).closest('.source_catalog_list_i').show();
                $('#' + statusId).prop('checked', true);
            });
        };

        var updateLocalStorage = function(obj) {
            localStorage.setItem('enabledStatus', JSON.stringify(obj));
        };

        var updateEnabledStatusObject = function(statusId) {
            if ( $('#' + statusId).prop('checked') ) {
                enabledStatus[statusId] = true;
            } else {
                delete enabledStatus[statusId];
            }
        };

        $(document).on('click', '.source_status-toggler_i', function() {
            var $this = $(this);
            var statusId = $this.attr('id');

            updateEnabledStatusObject(statusId);
            updateLocalStorage(enabledStatus);
            initEnabledStatusSpec();
        });

        // waiting when statuses update dom
        var checkStatuses = setInterval(function(){
            if ($('.source_status_badge').length) {
                initEnabledStatusSpec();
                clearInterval(checkStatuses);
            }
        }, 100);

    };

    GlobalNav.prototype.drawFilters = function(arr) {
        var $w = $('.source_subhead_filter-w'),
            html = '<br/><a id="sortByAlphabet" href="#sort=alphabet">Sort by alphabet</a>' +
                   '<br/><a id="sortByDate" href="#sort=date">Sort by date</a>',
            _this = this;

        $w.append(html);

        $(document).on('click', '#sortByAlphabet', function() {
            _this.sortByChild('sortByAlph');
        });
        $(document).on('click', '#sortByDate', function() {
            _this.sortByChild();
        });
    };

    GlobalNav.prototype.sortByChild = function(sortType) {
        var $list = $('.source_catalog_list');

        $list.each(function() {
            var $list_i = $(this).children('.source_catalog_list_i');

            if (sortType == "sortByAlph") {

                $list_i.sort(function(a, b) {
                    a = a.getAttribute('data-title').replace(/(^\s+|\s+$)/g,'');
                    b = b.getAttribute('data-title').replace(/(^\s+|\s+$)/g,'');

                    return (a < b) ? -1 : (a > b) ? 1 : 0;
                });

            } else {

                $list_i.sort(function(a, b) {
                    a = parseInt( a.getAttribute('data-date') );
                    b = parseInt( b.getAttribute('data-date') );

                    return (a < b) ? 1 : (a > b) ? -1 : 0;
                });

            }

            $(this).empty().append($list_i);
        });

    };

    return new GlobalNav();

});