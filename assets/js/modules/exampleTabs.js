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
            tabType: 'checkbox',
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

        for (var i = 0; i < sections.getQuantity(); i++) {
            var section = sections.getSections()[i];

            Object.keys(section.examples).forEach(function(exampleID){
                var example = section.examples[exampleID];

                example.tabs = {
                    $el: _this.drawContainer(example)
                };
            });
        }
    };

    ExampleTabs.prototype.getTabHTML = function (conf) {
        var _this = this;
        var $tab = $([
            '<li class="source_example-tabs_tab">' +
                '<label>' +
                    '<input class="source_example-tabs_input" data-content-id="'+conf.contentID+'" type="'+_this.moduleOpts.tabType+'" name="'+conf.exampleID+'">',
                    '<span class="source_example-tabs_text"></span>',
                '</label>' +
            '</li>'
        ].join(''));

        $tab.find('.source_example-tabs_text').text(conf.text);

        $tab.find('.source_example-tabs_input').on('change', function(){
            var $this = $(this);
            var contentID = $this.attr('data-content-id');

            $('#' + contentID).toggleClass('source_hidden');
        });

        if (_this.moduleOpts.showAll || conf.checked) {
            $tab.find('.source_example-tabs_input').attr('checked', true);
        }

        return $tab;
    };

    ExampleTabs.prototype.drawContainer = function (target) {
        var _this = this;
        var $codeConainers = target.$el.prevUntil('*:not([class*="src-"])');
        var $beforeTarget = $codeConainers.length > 0 ? $($codeConainers[$codeConainers.length - 1]) : target.$el;
        var tabID = target.id + '-tabs';

        var $firstTab = _this.getTabHTML({
            checked: true,
            exampleID: target.id,
            contentID: target.id,
            text: _this.res.DEFAULT_TAB
        });

        var $containerTpl = $('<ul class="source_example-tabs" id="'+ tabID +'"></ul>').html($firstTab);

        // Add tabs before all code examples
        $beforeTarget.before($containerTpl);

        return $containerTpl;
    };

    ExampleTabs.prototype.addTab = function ($target, conf) {
        var _this = this;
        var $newTab = _this.getTabHTML({
            checked: conf.checked || false,
            exampleID: conf.exampleID,
            contentID: conf.contentID,
            text: conf.text || 'Source'
        });

        $target.append($newTab)
    };

    return new ExampleTabs();

});