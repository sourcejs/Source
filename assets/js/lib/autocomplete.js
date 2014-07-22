(function(module) {
	if (typeof(define) === "function" && define.amd) {
		define(["jquery"], module);
	} else {
		module(jquery);
	}
})(function($) {
"use strict";

	var Autocomplete = function(target, options) {
		if (!target) return;
		this.init(target, options);
	};

	var keys = { "ESC": 27, "TAB": 9, "RETURN": 13, "UP": 38, "DOWN": 40, "CTRL": 17, "CMD": 91 };

	var transliteration = {
		'ЗГ':'ZGH', 'Зг':'Zgh', 'зг':'zgh',
		'А':'A', 'а':'a',
		'Б':'B', 'б':'b',
		'В':'V', 'в':'v',
		'Г':'G', 'г':'g',
		'Д':'D', 'д':'d',
		'Е':'E', 'е':'e',
		'Ж':'Zh', 'ж':'zh',
		'З':'Z', 'з':'z',
		'И':'I', 'и':'i',
		'ї':'i',
		'Й':'I', 'й':'i',
		'К':'K', 'к':'k',
		'Л':'L', 'л':'l',
		'М':'M', 'м':'m',
		'Н':'N', 'н':'n',
		'О':'O', 'о':'o',
		'П':'P', 'п':'p',
		'Р':'R', 'р':'r',
		'С':'S', 'с':'s',
		'Т':'T', 'т':'t',
		'У':'U', 'у':'u',
		'Ф':'F', 'ф':'f',
		'Х':'Kh', 'х':'kh',
		'Ц':'Ts', 'ц':'ts',
		'Ч':'Ch', 'ч':'ch',
		'Ш':'Sh', 'ш':'sh',
		'Щ':'Shch', 'щ':'shch',
		'Ы':'Y', 'ы':'y',
		'Э':'E', 'э':'e',
		'Ю':'Yu', 'ю':'iu',
		'Я':'Ya', 'я':'ia',
		'Ь': '`', 'ь': '`',
		'Ъ': '`', 'ъ': '`'
	};

	Autocomplete.prototype = {
		config : {
			"lookup": [],
			"transliteration": true,
			"autoSelectFirst": true,
			"caseSensetive": false,
			"classes": {
				"container": "autocomplete-suggestions",
				"selected": "autocomplete-selected",
				"suggestion": "autocomplete-suggestion",
				"wrapper": "autocomplete-wrapper",
				"showAll": "autocomplete-show-all"
			},
			"containerParent": "body",
			"containerHeight": 500, // px
			"showAll": undefined, // e.g. function(data) { <do smth> }
			"labels": {
				"showAllButtonText": "Show all"
			}
		},

		init: function(target, options) {
			this.$target = $(target);
			this.visible = false;
			this.cachedSearchResults = this.cachedSearchResults || {};

			$.extend(true, this.config, options);

			this.initContainer();
			this.initHandlers();
		},

		/**
		 * @function initContainer. It initializes search results box,
		 * its position and size.
		 */
		initContainer: function() {
			var config = this.config;
			var $target = this.$target;
			var $container = this.$container = $('<div>').addClass(config.classes.container);
			var rootElement = $container;
			var containerHeight = this.config.containerHeight;


			if (typeof(config.showAll) === "function") {
				var $showAll = this.$showAll = $("<div>")
					.addClass(config.classes.showAll)
					.html("<a href=\"#\">" + config.labels.showAllButtonText + "</a>");
				var $wrapper = $("<div>").addClass(config.classes.wrapper)
					.append($container)
					.append($showAll);
				rootElement = $wrapper;
			}

			this.$root = rootElement.css({
				"position": "fixed",
				"display": "none",
				"z-index": 9999
			});

			rootElement.appendTo(config.containerParent);

			var relocateContainer = function() {
				var offset = $target.offset();
				var bottomOffset = 75; // px
				var wHeight = $(window).height();
				rootElement.css({
					"top": (offset.top + $target.outerHeight(true)) + "px",
					"left": offset.left + "px"
				});
				$container.css("max-height", (wHeight < containerHeight ? wHeight - bottomOffset : containerHeight) + "px");
				var width = $target.outerWidth(true) - 2;
				rootElement.width(width);
			};
			$(window).resize(relocateContainer);
			relocateContainer();
		},

		/**
		 * @function initHandlers. It initializes handlers for search items & container events
		 *
		 * N.B.
		 * To implement new handler you need to add it in "handlers" object below
		 * To use implemented event handler you can recieve it by getHandler(<handlerName>) method.
		 *
		 * JFYI: Implemented handlers are binded (by jQuery.proxy) to Autocomplete instance,
		 * due to that, "this" in handlers body is a pointer to Autocomplete instance.
		 */
		initHandlers: function() {
			var _this = this;
			this.keyMap = []; // this array helps to catch keys combination.

			this.$target.on(window.opera ? "keypress" : "keydown", this.getHandler("onKeyPress"))
				.on('keyup', this.getHandler("onKeyUp"))
				.on('input', this.getHandler("onValueChanged"));

			this.$target.on("blur", function(e) {
				$(document).one("click", function(e) {
					if (!$(e.target).is(_this.$target) && !$.contains(_this.$container.get(0), e.target)) {
							_this.flush();
					}
				});
			});
			var containerSelector = "." + this.config.classes.container;
			var itemSelector = "." + this.config.classes.suggestion;
			var callback = this.config.onSelect;

			this.$container.on("mouseover", itemSelector, function() {
				_this.select($(this).data("index"));
			});

			if (this.$showAll) {
				this.$showAll.on('click', this.getHandler("onShowAllClick"));
			}
		},

		getHandler: function(name) {
			return $.proxy(handlers[name], this);
		},

		createResultRow: function(index, item) {
			return $("<div>")
				.addClass(this.config.classes.suggestion)
				.data("index", index)
				.html('<a href="' + item.data + '">' + item.value + '</a>').get(0);
		},

		wrapItems: function(data) {
			var result = document.createDocumentFragment();
			var _this = this;
			$.each(data, function(index, item) {
				result.appendChild(_this.createResultRow(index, item));
			});
			return result;
		},

		getSearchQuery: function() {
			var inputText = this.$target.val();
			if (!inputText || !inputText.length) {
				return;
			}
			var isTranslitEnabled = this.config.transliteration;
			var transliterated = inputText;
			// TODO: make sure that we realy need it
			inputText = inputText.replace(/[\{\}\[\]\(\)\\\.\*\?\+]{1}/g, "");
			var cyrillic = /[\u0400-\u04FF]/gi;
			if (isTranslitEnabled) {
				if (transliterated.search(cyrillic) >= 0) {
					transliterated = transliterated.replace(cyrillic, function(ch) {
						return transliteration[ch];
					});
				} else {
					$.each(transliteration, function(cyr, lat) {
						transliterated = transliterated.replace(new RegExp(lat,["g"]), cyr);
					});
				}
			}
			return isTranslitEnabled ? transliterated + "|" + inputText : inputText;
		},

		getSearchResults: function(searchQuery) {
			var data = [];
			var caseSensetive = this.config.caseSensetive;
			var replacementExpr = "<strong>$1</strong>";

			$.map(this.config.lookup, function(item) {
				var pattern = caseSensetive ? item.value : item.value.toLowerCase();
				var substrStartPos = pattern.search(new RegExp(searchQuery));
				if (substrStartPos < 0) return true;
				data.push({
					"value": item.value.replace(new RegExp("(" + searchQuery + ")",'gi'), replacementExpr),
					"data": item.data
				});
			});

			if (data.length && searchQuery) {
				this.cachedSearchResults[searchQuery] = data;
			}

			return data;
		},

		formatSearchResult: function() {
			var searchQuery = this.getSearchQuery();
			if (!searchQuery || !searchQuery.length) {
				this.flush();
			} else {
				var searchResult = this.cachedSearchResults[searchQuery];
				return (searchResult && searchResult.length)
					? searchResult
					: this.getSearchResults(searchQuery);
			}
		},

		flush: function() {
			this.visible = false;
			this.$target.val("");
			this.$container.empty()
			this.$root.hide();
			this.flushSelection();
		},

		/**
		 * selection handlers for search results
		 */
		selectNext: function() {
			var itemsLength = this.$container.children().length;
			this.selectedIndex = (this.selectedIndex < 0) || (this.selectedIndex + 1 >= itemsLength)
				? 0
				: this.selectedIndex + 1;
			this.select();
		},

		selectPrev: function() {
			var itemsLength = this.$container.children().length;
			this.selectedIndex  = this.selectedIndex < 0
				? 0
				: this.selectedIndex === 0 ? itemsLength - 1 : this.selectedIndex - 1;
			this.select();
		},

		select: function(index) {
			var selectionIndex = index ? index : this.selectedIndex;
			if (selectionIndex < 0) return;

			var items = this.$container.children();
			if (!items || !items.length) return;

			var selectedClass = this.config.classes.selected;

			this.$container.children("." + selectedClass).removeClass(selectedClass);
			$(items.get(selectionIndex)).addClass(selectedClass);
		},

		flushSelection: function() {
			this.selectedIndex = this.config.autoSelectFirst ? 0 : -1;
			this.select();
		},

		openSelected: function(inNewTab) {
			var selectedItem = this.$container.children().get(this.selectedIndex);
			if (!selectedItem) return;

			var link = $(selectedItem).find("a").attr("href");
			if (!link) return;

			// we should check if origin exists (in case of IE)
			var winLocation = window.location;
			var isOriginExists = winLocation && winLocation.origin;
			var url = isOriginExists
				? winLocation.origin + link
				: winLocation.protocol + "//" + winLocation.hostname + (winLocation.port ? ":" + winLocation.port : "") + link;

			window.open(link, inNewTab ? "_blank" : "_self");
			window.focus();
		}
	};

	// We use setTimeout here to prevent huge number of handlers calls
	var searchQueryTimeout;
	Autocomplete.prototype.getSearchData = function() {
		if (!searchQueryTimeout) {
			var _this = this;
			searchQueryTimeout = setTimeout(function() {
				var dataSubset = _this.formatSearchResult();
				if (dataSubset && dataSubset.length) {
					_this.$container.html(_this.wrapItems(dataSubset));
					_this.$root.show();
					_this.visible = true;
				} else {
					_this.visible = false;
					_this.$container.empty();
					_this.$root.hide();
				}
				searchQueryTimeout = 0;
				_this.flushSelection();
			}, 50);
		}
	};

	// this for handlers is Autocomplete object instance
	var handlers = {
		"onKeyPress": function(e) {
			e = e || event; //to make a deal with old IE
			this.keyMap.push(e.keyCode);
			switch(e.keyCode) {
				case (keys.ESC) :
					this.flush();
					break;
				case (keys.UP):
					this.selectPrev();
					break;
				case (keys.DOWN):
					this.selectNext();
					break;
				case (keys.TAB):
					this.selectNext();
					break;
				case (keys.RETURN):
					break;
				default:
					return;
			}
		},
		"onKeyUp": function(e) {
			e = e || event; // to make a deal with IE
			if (~$.inArray(keys.RETURN, this.keyMap)) {
				var isModifierPressed = ~$.inArray(keys.CTRL, this.keyMap) || ~$.inArray(keys.CMD, this.keyMap);
				this.openSelected(isModifierPressed);
			}
			this.keyMap = [];
		},
		"onValueChanged": function(e) {
			this.getSearchData();
		},
		"onShowAllClick": function(e) {
			var callback = this.config.showAll;
			if (typeof(callback) !== "function") return false;
			callback.call(this, this.formatSearchResult());
		}
	};

	$.fn.autocomplete = function(options, args) {
		return this.each(function () {
			var searchInstance = new Autocomplete(this, options);
		});
	};
});
