define(['jquery'], function($) {
"use strict";

var ModalBox = function(options, data) {
	$.extend(true, this.config, options);
	this. data = $.extend(true, {"title": "", "body": "", "close": "x"}, data);
	this.init();
	this.visible = false;
};

ModalBox.prototype = {
	"config": {
		"removeOnHide": true,
		"classes": {
			"box": "source_modalbox_box",
			"fade": "source_modalbox_fade",
			"title": "source_modalbox_title",
			"body": "source_modalbox_body",
			"close": "source_modalbox_close"
		},
		"appendTo": "body",
		"useCustomStyles": true,
	},

	"init": function() {
		var config = this.config;
		var customCSS = config.useCustomStyles;
		var _this = this;
		var box = this.$box = $("<div>")
			.addClass(config.classes.box)
			.hide();

		$.map(["close", "title", "body"], function(name) {
			_this[name] = $("<div>")
				.addClass(config.classes[name])
				.html(_this.data[name] ? _this.data[name] : "");
			box.append(_this[name]);
		});

		box.appendTo(config.appendTo);

		this.$fade = $("<div>")
			.addClass(config.classes.fade)
			.appendTo(this.config.appendTo);
		var _this = this;
		var closeEventsHandler = function(e) {
			if ($(e.target).is(_this.close) || (e.keyCode && e.keyCode === 27)) {
				_this.hide();
			}
		};

		$("body").on("keydown", closeEventsHandler);
		this.close.on("click", closeEventsHandler);
	},

	"show": function() {
		if (this.visible) return;
		this.$box.show();
		this.$fade.show();
		this.visible = true;
		return this;
	},

	"hide": function() {
		if (!this.visible) return;
		this.$box.hide();
		this.$fade.hide();
		this.config.removeOnHide && this.$box.remove() && this.$fade.remove();
		return this;
	},

	"isVisible": function() {
		return this.visible;
	}
};

return ModalBox;

});
