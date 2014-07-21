define([
	'jquery',
	'sourceModules/module',
	], function($, module) {
"use strict";

var ModalBox = function(options, data) {
	$.extend(true, this.config, options);
	this. data = $.extend(true, {"title": "", "body": "", "close": "x"}, data);
	this.init();
	this.visible = false;
};

ModalBox.prototype = module.createInstance();
ModalBox.prototype.constructor = ModalBox;

ModalBox.prototype.init = function() {
	var config = this.options.modulesOptions.modalBox =
		$.extend(true, this.options.modulesOptions.modalBox, {
		"removeOnHide": true,
		"classes": {
			"box": "source_modal_box",
			"fade": "source_modal_fade",
			"title": "source_modal_t",
			"body": "source_modal_body",
			"close": "source_modal_close"
		},
		"appendTo": "body",
		"useCustomStyles": true,
	});
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
		.appendTo(config.appendTo);
	var _this = this;
	var closeEventsHandler = function(e) {
		if ($(e.target).is(_this.close) || (e.keyCode && e.keyCode === 27)) {
			_this.hide();
		}
	};

	$("body").on("keydown", closeEventsHandler);
	this.close.on("click", closeEventsHandler);
};

ModalBox.prototype.show = function() {
	if (this.visible) return;
	this.$box.show();
	this.$fade.show();
	this.visible = true;
	return this;
};

ModalBox.prototype.hide = function() {
	var config = this.options.modulesOptions.modalBox;
	if (!this.visible) return;
	this.$box.hide();
	this.$fade.hide();
	config.removeOnHide && this.$box.remove() && this.$fade.remove();
	return this;
};

ModalBox.prototype.isVisible = function() {
	return this.visible;
};

return ModalBox;

});
