SourceJS.define([
    'jquery',
    'sourceModules/utils',
    'text!/api/options',
    'sourceModules/inlineOptions'
], function($, Utils, options, inlineOptions) {
    'use strict';

    /**
     * Foundation class for implementing core application logic.
     */
    var Module = function() {};

    Module.create = function(definition) {
        //var module = Utils.getComponent(definition.name);

        var _definition = $.extend(true, {}, definition);// TODO: merge

        var _constructor = Utils.inherit(this, function(config) {
            this.data = config.data || {};
            this.config = $.extend(true, {}, definition.config, config, JSON.parse(options), inlineOptions);
            this.init();
            this.target = this.get('config.target');
        });

        var _prototype = _constructor.prototype;

        if (_definition.methods) {
            $.extend(_prototype, _definition.methods);
        }

        _prototype.templates = _definition.templates;
        _prototype.renderers = _definition.renderers;
        _prototype.name = _definition.name;
        _prototype.init = _definition.init;
        _constructor._definition = _definition;
        if (definition.inherits) {
            _constructor.parent = definition.inherits.prototype;
        }

        _prototype.cssClass = _definition.name.toLowerCase().replace(/-/g, "").replace(/\./g, "-");
        _prototype.cssPrefix = _prototype.cssClass + "-";

        // FIXME: set into namespace
        //var result = $.extend(_constructor, module);

        return _constructor;

    };

    Module.define = function(name) {
        return {
            'name': name,
            'events': {},
            'methods': {},
            'renderers': {},
            'templates': {},
            'config': {},
            'plugins': {},
            'init': function() {
                this.render();
            }
        };
    };

    Module.requireTemplate = function(name) {
        console.log('requireTemplate method stub');
        return "";
    };

    Module.prototype.templates = {};

    Module.prototype.init = function() {};

    Module.prototype.get = function(key) {
        return Utils.get(this, key);
    };

    Module.isExist = function(module) {
        return Utils.isExist(module.name);
    };

    Module.prototype.set = function(key, value) {
        console.log("set stub");

    };

    Module.prototype.render = function() {
        console.log("render stub");
    };

    return Module;
});