define(['jquery'], function($) {
"use strict";

	// TODO: U need to do :retab with tabsize=4!!!!

	// --------------------------------------------------
	// issue: https://github.com/sourcejs/Source/issues/41
	// So far we got live-search results in main input field.
	// Few improvements to suggest here:
	//
	// ability to cmd/ctrl - click on result and have it opened in a tab or whatever (alternatively we could use extra link to open all results in separate tabs)
	// have a new link to open separate page with all possible results on query Something like this: http://puu.sh/9evEI/66f6628168.png
	//
	// --------------------------------------------------
	// issue: https://github.com/sourcejs/Source/issues/40
	// Make available to use different languages in search with transcription using latin letters and vice versa.
	//
	// example:
	//
	// you search "lenta" - you get "лента"
	// you search "триггер" - you get "trigger"
	//
	// --------------------------------------------------
	// issue https://github.com/sourcejs/Source/issues/24
	// It would be great to make more personalized service using user spec search requests. Output can be built / sort by request weight.
	//
	// Search settings can be saved in local account storage.

	var Autocomplete = function(target, options) {
		if (!target) return;
		this.init(target, options);
	};

	var keys = {
		ESC: 27,
		TAB: 9,
		RETURN: 13,
		UP: 38,
		DOWN: 40
	};

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
			"autoSelectFirst": false,
			"classes": {
				"container": "autocomplete-suggestions",
				"selected": "autocomplete-selected",
				"suggestion": "autocomplete-suggestion"
			},
			"onSelect": function() {},
			"containerParent": "body"
		},

		init: function(target, options) {
			this.target = target;
			this.$target = $(target);
			// merging options & config
			var self = this;
			$.each(options, function(key, value) {
				if (typeof value === undefined || !self.config.hasOwnProperty(key)) {
					return;
				}
				self.config[key] = value;
			});
			
			this.states = {
				"visible": false
			};

			this.initContainer();
			this.initHandlers();
		},
		
		/**
		 * @function initContainer. It initializes search results box,
		 * its position and size.
		 */
		initContainer: function() {
			var config = this.config;
			var self = this;
			var container = this.container = document.createElement('div');
			container.className = config.classes.container;
			container.style.position = "absolute";
			container.style.display = "none";
			
			$(container).appendTo(config.containerParent);

			var relocate = function() {
				var offset = self.$target.offset();
				$(container).css({
					"top": (offset.top + self.$target.outerHeight(true)) + "px",
					"left": offset.left + "px"
				});
				var width = self.$target.outerWidth(true) - 2;
				$(container).width(width);
			};
		
			$(window).resize(relocate);
			
			relocate();
		},

		/**
		 * @function initHandlers. It initializes handlers for search items & container events
		 */
		initHandlers: function() {
			var self = this;
			if (window.opera) {
				$(this.target).on('keypress', this.getHandler("onKeyPress"));
			} else {
				$(this.target).on('keydown', this.getHandler("onKeyPress"));
			}
			var containerSelector = "." + this.config.classes.container;
			var itemSelector = "." + this.config.classes.suggestion;
			var callback = this.config.onSelect;

			$(this.container).on("mouseover", itemSelector, function() {
				self.select(this);
			});
		},

		createResultRow: function(index, item) {
			var row = document.createElement("div");
			row.className = this.config.classes.suggestion;
			row.setAttribute("data-index", index);
			row.innerHTML = '<a href="' + item.data + '">' + item.value + '</a>';
			return row;
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
			// TODO: make sure that we need it
			inputText = inputText.replace(/[\{\}\[\]\(\)\/\\\.\*\?\+]{1}/g, "");
			if (this.config.transliteration) {
				var transliterated = inputText.replace(/[\u0400-\u04FF]/gi, function(ch) {
					return transliteration[ch];
				});
			}
			return transliterated ? transliterated : inputText;
		},

		getSearchResults: function(searchQuery) {
			var data = [];
			console.log("searching ", searchQuery);
			this.cachedSearchResults = this.cachedSearchResults || {};
			for (var index in this.config.lookup) {
				if (this.config.lookup[index].value.indexOf(searchQuery) > 0) {
					data.push(this.config.lookup[index]);
				}
			}
			return data;
		},

		formatSearchResult: function() {
			var searchQuery = this.getSearchQuery();
			if (!searchQuery || !searchQuery.length) {
				this.flush();
			} else {
				return (this.cachedSearchResults && this.cachedSearchResults[searchQuery])
					? this.cachedSearchResults[searchQuery]
					: this.getSearchResults(searchQuery);
			}
		},

		flush: function() {
			this.$target.val("");
			$(this.container).empty().hide();
			this.flushSelection();
		},

		/**
		 * selection handlers for search results
		 */
		selectNext: function() {
			var itemsLength = $(this.container).children().length;
			this.selectedIndex = (this.selectedIndex < 0) || (this.selectedIndex + 1 >= itemsLength)
				? 0
				: this.selectedIndex + 1;
			this.select();
		},

		selectPrev: function() {
			var itemsLength = $(this.container).children().length;
			this.selectedIndex  = this.selectedIndex < 0
				? 0
				: this.selectedIndex === 0 ? itemsLength - 1 : this.selectedIndex - 1;
			this.select();
		},

		select: function(item) {
			var items = $(this.container).children();
			var selectedClass = this.config.classes.selected;
			if (!items || !items.length) return;

			if (item && item.dataset) {
				this.selectedIndex = Number.parseInt(item.dataset["index"]);
			}
			$(this.container).children("." + selectedClass).removeClass(selectedClass);
			$(items.get(this.selectedIndex)).addClass(selectedClass);
		},

		flushSelection: function() {
			this.selectedIndex = this.config.autoselectFirst ? 0 : -1;
			this.select();
		},

		applySelected: function() {
			console.log("apply");
		}
	};

	var searchQueryTimeout;
	Autocomplete.prototype.onSearchRowChanged = function() {
		if (!searchQueryTimeout) {
			var self = this;
			searchQueryTimeout = setTimeout(function() {
				var dataSubset = self.formatSearchResult();
				if (dataSubset && dataSubset.length) {
					$(self.container).html(self.wrapItems(dataSubset)).show();
					self.states.visible = true;
				}
				searchQueryTimeout = 0;
				self.flushSelection();
			}, 50);
		}
	};

	
	// this for handlers is Autocomplete object instance
	var handlers = {
		"onKeyPress": function(e) {
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
					this.applySelected()
					break;
				default:
					this.onSearchRowChanged();
					return;
			}
		}
	};

	Autocomplete.prototype.getHandler = function(name) {
		return $.proxy(handlers[name], this);
	};

	
	$.fn.autocomplete = function (options, args) {
		return this.each(function () {
			var searchInstance = new Autocomplete(this, options);
		});
	};

});
