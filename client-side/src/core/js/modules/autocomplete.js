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
		this.target = target;
		this.initConfig(options)
		this.initContainer();
		this.initHandlers();
	};

	Autocomplete.prototype.config = {
		"lookup": [],
		"transliteration": false,
		"autoSelectFirst": false,
		"classes": {
			"container": "autocomplete-suggestions",
			"selected": "autocomplete-selected",
			"suggestion": "autocomplete-suggestion"
		},
		"onSelect": function() {},
		"containerParent": "body"
	};

	Autocomplete.prototype.initConfig = function(options) {
		var self = this;
		$.each(options, function(key, value) {
			if (typeof value === undefined || !self.config.hasOwnProperty(key)) {
				return;
			}
			self.config[key] = value;
		});
	};

	Autocomplete.prototype.initContainer = function() {
		var container = this.container = document.createElement('div');
		container.className = this.config.classes.container;
		container.style.position = "absolute";
		container.style.display = "none";
		$(container).appendTo(this.config.containerParent);
	};

	Autocomplete.prototype.getSearchText = function() {
		console.warn("this method is not implemented yet");
		return "test";
	};

	Autocomplete.prototype.formatSearchResult = function() {
		console.warn("this method is not implemented yet");
		return this.config.lookup;
	};

	Autocomplete.prototype.setSearchData = function(data) {
		console.warn("this method is not implemented yet");
		return false;
	};

	Autocomplete.prototype.initHandlers = function() {
		var self = this;
		// search form handlers initialization
		var keyPressCallback = function(e) {
			var dataSubset = self.formatSearchResult();
			console.log("result data is: ",dataSubset); 
			if (dataSubset.length > 0) {
				self.setSearchData(dataSubset);
				$(self.container).show();
			}
		};
		if (window.opera) {
			$(this.target).on('keypress', keyPressCallback);
		} else {
			$(this.target).on('keydown', keyPressCallback);
		}
		//container handlers initialization
		var containerSelector = "." + this.config.classes.container;

		// items handlers initialization
		var itemSelector = "." + this.config.classes.suggestion;
		var callback = this.config.onSelect;
		$(this.container).on("click", "." + itemSelector, function() {
			console.log("item click handler called");
			callback.apply(this);
		});
	};

	$.fn.autocomplete = function (options, args) {
		return this.each(function () {
			var searchInstance = new Autocomplete(this, options);
		});
	};

});
