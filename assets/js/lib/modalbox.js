"use strict";
define([
    'jquery',
    'sourceModules/module',
    ], function($, module) {

var blocks = ["close", "title", "body"]; //array with blocks names to process content
var initialBlocksData = {};
$.map(blocks, function(name) { initialBlocksData[name] = ""; });
var context; // instance of box

var ModalBox = function(options, data) {
    var isNewInstance = !context;
    context = context || this;
    context.data = data ? data : initialBlocksData;    

    if (!isNewInstance) {
        $.map(blocks, function(name) {
            context[name].html(context.data[name] ? context.data[name] : "");
        });
        return context;
    }

    context.options.modulesOptions.modalBox = $.extend(true, 
        context.options.modulesOptions.modalBox, {
        "classes": {
            "box": "source_modal_box",
            "title": "source_modal_title",
            "body": "source_modal_body",
            "close": "source_modal_close"
        },
        "appendTo": ".source_main"
    }, options);

    context.init();
};

ModalBox.prototype = module.createInstance();
ModalBox.prototype.constructor = ModalBox;

ModalBox.prototype.init = function() {
    var config = this.options.modulesOptions.modalBox;
    var box = this.$box = $("<div>")
        .addClass(config.classes.box)
        .hide();

    $.map(blocks, function(name) {
        context[name] = $(['<div class="', config.classes[name],'"></div>'].join(''))
            .html(context.data[name] ? context.data[name] : "");
        box.append(context[name]);
    });

    $(config.appendTo).after(box);

    this.initCloseHandler();
};

ModalBox.prototype.initCloseHandler = function() {
    var closeEventsHandler = function(e) {
        if ($(e.target).is(context.close) || (e.keyCode && e.keyCode === 27)) {
            context.hide();
        }
    };

    $("body").on("keydown", closeEventsHandler);
    this.close.on("click", closeEventsHandler);
};

ModalBox.prototype.show = function() {
    var config = this.options.modulesOptions.modalBox;
    $(config.appendTo).hide();
    this.$box.show();
    return this;
};

ModalBox.prototype.hide = function() {
    var config = this.options.modulesOptions.modalBox;
    $(config.appendTo).show();
    this.$box && this.$box.hide();
    return this;
};

return ModalBox;
});