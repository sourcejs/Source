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
    };

    //Drawing navigation and page info in each catalog defined on page
    GlobalNav.prototype.drawNavigation = function () {
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
            sortType = this.options.modulesOptions.globalNav.sortType || 'sortByDate';
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
                            authorName = ' | ' + RES_AUTHOR + ': ' + target.author + '';
                        }

                        //fixing relative path due to server settings
                        var targetUrl = target.url;
                        if(targetUrl.charAt(0) !== '/')
                            targetUrl = '/' + targetUrl;

                        navTreeHTML += '' +
                                '<li class="' + CATALOG_LIST_I + '">' +
                                '<a class="' + CATALOG_LIST_A + '" href="' + targetUrl + '">' +
                                '<img class="' + CATALOG_LIST_A_IMG + '" src="' + targetUrl + '/' + CATALOG_LIST_I_PREVIEW_NAME + '" >' +
                                '<span class="' + CATALOG_LIST_A_TX + '">' + target.title + '</span>' +
                                '<div class="' + CATALOG_LIST_DATE + '">' + target.lastmod + authorName + '</div>';

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

    GlobalNav.prototype.createNavTreeItem = function(target) {
        if (!target) return;
        var navConfig = this.options.modulesOptions.globalNav;
        var author = target.author
            ? " | " + navConfig.RES_AUTHOR + ": " + target.author
            : "";

        //fixing relative path due to server settings
        var targetUrl = target.url.charAt(0) === '/' ? target.url : '/' + target.url;
        var imageUrl = targetUrl + '/' + navConfig.CATALOG_LIST_I_PREVIEW_NAME;

        if (!this.createNavTreeItem.template) {
            this.createNavTreeItem.template =
            $("<li>").addClass(navConfig.CATALOG_LIST_I).append(
                $("<a>").addClass(navConfig.CATALOG_LIST_A)
                    .append($("<img>").addClass(navConfig.CATALOG_LIST_A_IMG))
                    .append($("<span>").addClass(navConfig.CATALOG_LIST_A_TX))
                    .append($("<div>").addClass(navConfig.CATALOG_LIST_DATE))
                    .append($("<div>").addClass(navConfig.CATALOG_LIST_BUBBLES))
            );
        }
        var result = this.createNavTreeItem.template.clone(true);
        result.find("." + navConfig.CATALOG_LIST_A).attr("href", targetUrl);
        result.find("." + navConfig.CATALOG_LIST_A_IMG).attr("src", imageUrl);
        result.find("." + navConfig.CATALOG_LIST_A_TX).html(target.title);
        result.find("." + navConfig.CATALOG_LIST_DATE).html(target.lastmod + author);
        if(parseInt(target.bubbles)) {
            result.find("." + navConfig.CATALOG_LIST_BUBBLES).html(target.bubbles);
        }

        return result;
    };

    GlobalNav.prototype.drawToggler = function(){
        var _this = this,
            L_CATALOG = $('.' + _this.options.modulesOptions.globalNav.CATALOG),
            CATALOG_IMG_TUMBLER = _this.options.modulesOptions.globalNav.CATALOG_IMG_TUMBLER;

        L_CATALOG.filter('[data-nav*="base"],[data-nav*="project"]').each(function(){

            var $this = $(this),
                /* for each type of data-nav own localStorage */
                _tumblerMode = $this.attr('data-nav').substr(1),
                tumblerMode = localStorage.getItem( _tumblerMode + 'TumblerMode');

            if ( tumblerMode && tumblerMode == 'showPreview' ) {

                $this
                    .addClass('__show-preview')
                    .prepend('<a class="' + CATALOG_IMG_TUMBLER + '" href="#">Скрыть превьюшки</a>');

            } else if (!tumblerMode && _tumblerMode == 'base' ) {

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

    return new GlobalNav();

});