"use strict";
define([
    'jquery',
    'sourceModules/module',
    'sourceLib/lodash'
    ], function($, module, _) {

var context; // instance of box

var ModalBox = function(config, data) {
    var isNewInstance = !context;
    context = context || this;
    context.data = data ? data : initialBlocksData;    

    if (!isNewInstance) {
        context.render();
        return context;
    }

    var modulesOptions = context.options.modulesOptions;
    modulesOptions.modalBox = $.extend(true, {
        "classes": {
            "box": [context.options.mainClass, context.options.colMain, "source_modal_box"].join(' '),
            "title": "source_modal_title",
            "body": "source_modal_body",
            "close": "source_modal_close"
        },
        "labels": {
            "close": "Close extended search results"
        },
        "appendTo": ".source_main"
    }, modulesOptions.modalBox,  config);

    context.init();
};

ModalBox.prototype = module.createInstance();
ModalBox.prototype.constructor = ModalBox;

ModalBox.prototype.init = function() {
    this.render();
    this.initCloseHandler();
};

ModalBox.prototype.templates = {
    box: _.template('<div class="<%= classes.box %>"></div>'),
    title: _.template('<div class="<%= classes.title %>"></div>'),
    close: _.template('<div class="<%= classes.close %>" title="<%= labels.close %>"></div>'),
    body: _.template('<div class="<%= classes.body %>"></div>')
};

ModalBox.prototype.renderers = {};

ModalBox.prototype.renderers.box = function(element) {
    $(this.options.modulesOptions.modalBox.appendTo).after(element);
};

ModalBox.prototype.renderers.close = function(element) {
    $(element).html(this.data.close ? this.data.close : "");
    $(this.box).append(element);
};

ModalBox.prototype.renderers.title = function(element) {
    $(element).html(this.data.title ? this.data.title : "");
    $(this.box).append(element);
};

ModalBox.prototype.renderers.body = function(element) {
    $(element).html(this.data.body ? this.data.body : "");
    $(this.box).append(element);
};

ModalBox.prototype.render = function() {
    var config = this.options.modulesOptions.modalBox;
    $.each(context.renderers, function(name, callback) {
        var element = context[name] = context[name]
            ? context[name]
            : $(context.templates[name].call(context, config));

        callback.call(context, element);
    });
};

ModalBox.prototype.initCloseHandler = function() {
    $(this.close).on("click", function(e) {
        context.hide();
    });
};

ModalBox.prototype.show = function() {
    var config = this.options.modulesOptions.modalBox;
    $(config.appendTo).hide();
    $(this.box).show();
    return this;
};

ModalBox.prototype.hide = function() {
    var config = this.options.modulesOptions.modalBox;
    $(config.appendTo).show();
    $(this.box).hide();
    return this;
};

return ModalBox;
});