/*
*
* Clarify helpers on spec page
*
* @author Robert Haritonov http://rhr.me
*
* */

'use strict';

sourcejs.amd.define([
    'jquery',
    'sourceModules/module',
    'sourceModules/sections',
    'sourceModules/specDecorations'
], function($, module, sections, specDecorations) {

    function ClarifyInSpec() {
        var _this = this;

        this.options.modulesOptions.clarifyInSpec = $.extend({}, {
            linkTitle: 'Open this example in Clarify'
        }, this.options.modulesOptions.clarifyInSpec);
        this.moduleOptions = this.options.modulesOptions.clarifyInSpec;

        $(function(){
            _this.drawClarifyLinks();
        });
    }

    ClarifyInSpec.prototype = module.createInstance();
    ClarifyInSpec.prototype.constructor = ClarifyInSpec;

    ClarifyInSpec.prototype.drawClarifyLinks = function(){
        var _this = this;

        var prependHTML = function($el, id){
            $el.prepend('<a class="source_clarify-in-spec_link" href="?clarify=true&sections=' + id + '" title="' + _this.moduleOptions.linkTitle + '"></a>');
        };

        for (var i = 0; i < sections.getQuantity(); i++) {
            var section = sections.getSections()[i];
            var $sectionHeader = section.headerElement;

            if (_this.haveSectionsInside($sectionHeader)) prependHTML($sectionHeader, section.id);

            if (section.subHeaderElements !== undefined) {
                for (var j = 0; j < section.subHeaderElements.length; j++) {
                    var $sectionSubHeader = section.subHeaderElements[j];
                    var subHeaderID = $sectionSubHeader.attr('id');

                    if (subHeaderID && _this.haveSectionsInside($sectionSubHeader)) {
                        prependHTML($sectionSubHeader, subHeaderID);
                    }
                }
            }
        }
    };

    ClarifyInSpec.prototype.haveSectionsInside = function($element){
        var _this = this;
        var response = false;
        var nodes = $element.closest("*").nextUntil("h2,h3,h4");

        nodes.each(function(){
            if ($(this).hasClass(_this.options.exampleSectionClass)) {
                response = true;
                return false;
            }
        });

        return response;
    };

    return new ClarifyInSpec();
});
