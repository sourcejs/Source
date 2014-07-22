define([
	'jquery',
	'sourceModules/module',
	], function($, module) {
"use strict";

var ModalBox = function(options, data) {
	$.extend(true, this.config, options);
	this.data = $.extend(true, {"title": "", "body": "", "close": ""}, data);
	this.init();
};

var visible = false;

ModalBox.prototype = module.createInstance();
ModalBox.prototype.constructor = ModalBox;

ModalBox.prototype.init = function() {
	var config = this.options.modulesOptions.modalBox =
		$.extend(true, this.options.modulesOptions.modalBox, {
		"removeOnHide": true,
		"classes": {
			"box": "source_modal_box",
			"title": "source_modal_tx",
			"body": "source_modal_body",
			"close": "source_modal_close"
		},
		"appendTo": ".source_main",
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

	$(config.appendTo).after(box);

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
	if (this.isVisible()) return;

	var config = this.options.modulesOptions.modalBox;
	$(config.appendTo).hide();
	this.$box.show();
	this.setVisible(true);
	return this;
};

ModalBox.prototype.hide = function() {
	var config = this.options.modulesOptions.modalBox;
	if (!this.isVisible()) return;

	var config = this.options.modulesOptions.modalBox;
	$(config.appendTo).show();
	this.$box.hide();
	config.removeOnHide && this.$box.remove();
	this.setVisible(false);
	return this;
};

ModalBox.prototype.isVisible = function() {
	return visible;
};

ModalBox.prototype.setVisible = function(_visible) {
	visible = _visible;
};

return ModalBox;

});
