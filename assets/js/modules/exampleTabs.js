/*
*
* @author Robert Haritonov (http://rhr.me)
*
* */

define([
    'jquery',
    'sourceModules/module',
    'sourceModules/sections'
], function ($, module, sections) {

    'use strict';

    function ExampleTabs() {
        this.options.modulesOptions.exampleTabs = $.extend(true, {
            showAll: false,
            tabType: 'radio',
            res: {
                DEFAULT_TAB: 'Example'
            }

        }, this.options.modulesOptions.exampleTabs);
        this.moduleOpts = this.options.modulesOptions.exampleTabs;
        this.res = this.moduleOpts.res;

        this.init();

        return this;
    }

    ExampleTabs.prototype = module.createInstance();
    ExampleTabs.prototype.constructor = ExampleTabs;

    ExampleTabs.prototype.init = function () {
        var _this = this;

        sections.sections.forEach(function (item) {
            Object.keys(item.examples).forEach(function(exItem){
                var target = item.examples[exItem];

                _this.drawContainer(target);
            });
        });
    };

    ExampleTabs.prototype.getTabHTML = function (conf) {
        var _this = this;
        var $tab = $([
            '<li class="source_example-tabs_tab">' +
                '<label>' +
                    '<input class="source_example-tabs_input" type="'+_this.moduleOpts.tabType+'">',
                    '<span class="source_example-tabs_text"></span>',
                '</label>' +
            '</li>'
        ].join(''));

        $tab.find('.source_example-tabs_text').text(conf.text);

        if (_this.moduleOpts.showAll || conf.checked) {
            $tab.find('.source_example-tabs_input').attr('checked', true);
        }

        return $tab[0].outerHTML;
    };

    ExampleTabs.prototype.drawContainer = function (target) {
        var _this = this;
        var $codeConainers = target.$el.prevUntil('*:not(code)');
        var $beforeTarget = $codeConainers.length > 0 ? $($codeConainers[$codeConainers.length - 1]) : target.$el;

        // TODO: add IDs to code, and then add attrs to tab
        // then add listeners to tabs, so if tab is checked, then show corresponding example

        var firstTab = _this.getTabHTML({
            checked: true,
            text: _this.res.DEFAULT_TAB
        });

        var $containerTpl = $('<ul class="source_example-tabs"></ul>').html(firstTab);

        // Add tabs before all code examples
        $beforeTarget.before($containerTpl);
    };

    return new ExampleTabs();

});