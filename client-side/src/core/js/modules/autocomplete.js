define(['jquery'], function($) {
"use strict";

	// TODO: U need to do :retab with tabsize=4

	// --------------------------------------------------
	// issue: https://github.com/sourcejs/Source/issues/41
	//
	// --------------------------------------------------
	// issue: https://github.com/sourcejs/Source/issues/40
	//
	// --------------------------------------------------
	// issue https://github.com/sourcejs/Source/issues/24
	// 

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
				"suggestion": "autocomplete-suggestion"
			},
			"containerParent": "body"
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
			var $container = this.$container = $('<div>')
				.addClass(config.classes.container)
				.css({
					"position": "absolute",
					"display": "none",
					"z-index": 1000
				});

			this.$container.appendTo(config.containerParent);

			var relocateContainer = function() {
				var offset = $target.offset();
				$container.css({
					"top": (offset.top + $target.outerHeight(true)) + "px",
					"left": offset.left + "px"
				});
				var width = $target.outerWidth(true) - 2;
				$container.width(width);
			};
			$(window).resize(relocateContainer);
			relocateContainer();
		},

		/**
		 * @function initHandlers. It initializes handlers for search items & container events
		 *
		 * N.B.
		 * To implement new handler you are to add it in "handlers" object below
		 * To use implemented event handler you can recieve it by getHandler(<handlerName>) method.
		 *
		 * JFYI: Implemented handlers are binded (by jQuery.proxy) to Autocomplete instance,
		 * due to that, "this" in handlers body is a pointer to Autocomplete instance.
		 */
		initHandlers: function() {
			var self = this;
			this.keyMap = []; // this array helps to catch keys combination.

			this.$target.on(window.opera ? "keypress" : "keydown", this.getHandler("onKeyPress"))
				.on('keyup', this.getHandler("onKeyUp"))
				.on('input', this.getHandler("onValueChanged"));
			var containerSelector = "." + this.config.classes.container;
			var itemSelector = "." + this.config.classes.suggestion;
			var callback = this.config.onSelect;

			this.$container.on("mouseover", itemSelector, function() {
				self.select($(this).data("index"));
			});
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
			var self = this;
			$.each(data, function(index, item) {
				result.appendChild(self.createResultRow(index, item));
			});
			return result;
		},

		getSearchQuery: function() {
			var inputText = this.$target.val();
			if (!inputText || !inputText.length) {
				return;
			}
			// TODO: make sure that we realy need it
			inputText = inputText.replace(/[\{\}\[\]\(\)\\\.\*\?\+]{1}/g, "");
			if (this.config.transliteration) {
				var transliterated = inputText.replace(/[\u0400-\u04FF]/gi, function(ch) {
					return transliteration[ch];
				});
			}
			return transliterated ? transliterated : inputText;
		},

		getSearchResults: function(searchQuery) {
			var data = [];
			var caseSensetive = this.config.caseSensetive;
			var replacementExpr = "<strong>$1</strong>";
			$.map(this.config.lookup, function(item) {
				var pattern = caseSensetive ? item.value : item.value.toLowerCase();
				var substrStartPos = pattern.search(searchQuery);
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
			this.$container.empty().hide();
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
			var url = winLocation && winLocation.origin
				? winLocation.origin + link
				: winLocation.protocol + "//" + winLocation.hostname + (winLocation.port ? ":" + winLocation.port : "") + link;

			window.open(link, inNewTab ? "_blank" : "_self");
			window.focus();
		}
	};

	// We use setTimeout here to prevent huge number of handlers calls
	var searchQueryTimeout;
	Autocomplete.prototype.onSearchRowChanged = function() {
		if (!searchQueryTimeout) {
			var self = this;
			searchQueryTimeout = setTimeout(function() {
				var dataSubset = self.formatSearchResult();
				if (dataSubset && dataSubset.length) {
					self.$container.html(self.wrapItems(dataSubset)).show();
					self.visible = true;
				} else {
					self.visible = false;
					self.$container.empty().hide();
				}
				searchQueryTimeout = 0;
				self.flushSelection();
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
			this.onSearchRowChanged();
		}
	};

	$.fn.autocomplete = function (options, args) {
		return this.each(function () {
			var searchInstance = new Autocomplete(this, options);
		});
	};

});
