/*
 *
 * Sections modules
 *
 * */

define([
    "jquery",
    "sourceModules/module"
    ], function ($, module) {

    'use strict';

    function Sections() {
        var _this = this;

        this.sections = [];

        $(function(){
            _this.scanDOM();
        });

        return this;
    }

    Sections.prototype = module.createInstance();
    Sections.prototype.constructor = Sections;

    Sections.prototype.scanDOM = function () {
        var _this = this;
        var exampleIDCounter = 1;

        $("." + _this.options.SECTION_CLASS).each(function (index, elem) {
            var $section = $(elem);
            var $header = $section.find('h2:first');
            var sectionSeqID = index + 1;
            var sectionID = _this.setSectionsId($section, sectionSeqID);

            var $examples = $section.find('.' + _this.options.EXAMPLE_CLASS);
            var examples = {};

            // Processing examples
            for (var j=0; j < $examples.length; j++) {
                var $targetExample = $($examples[j]);
                var exampleID = _this.setExampleId($targetExample, sectionID, exampleIDCounter);
                exampleIDCounter ++;

                examples[exampleID] = {
                    $el: $targetExample,
                    id: exampleID
                };
            }

            _this.addSection({
                num: sectionSeqID,
                id: sectionID,
                caption: $header.text(),
                sectionElement: $section,
                headerElement: $header,
                subHeaderElements: $section.children('h3'),
                examples: examples
            });
        });

        return this.getSections();
    };

    Sections.prototype.getSections = function () {
        return this.sections;
    };

    Sections.prototype.addSection = function (sec) {
        return this.sections.push(sec);
    };

    Sections.prototype.getQuantity = function () {
        return this.getSections().length;
    };

    // Adding unique ID to section, if it's present
    Sections.prototype.setSectionsId = function ($section, sectionSeqID) {
        var customID = $section.attr('id');
        var sectionID = customID || sectionSeqID;

        if (!customID) $section.attr('id', sectionID);

        $section.children('h3').each(function(index) {
            var $this = $(this);
            var subCustomID = $this.attr('id');
            var subSectionID = subCustomID || sectionSeqID + '.' + (index+1);

            if (!subCustomID) $this.attr('id', subSectionID);

            //$this.attr('data-parent-section', sectionID);
        });

        return sectionID;
    };

    // Adding unique ID to example, if it's present
    Sections.prototype.setExampleId = function ($example, sectionID, exampleSeqID) {
        var customID = $example.attr('id');
        var exampleID = customID || 'ex-' + exampleSeqID;

        if (!customID) $example.attr('id', exampleID);

        //var parentSubHeading = $example.prevAll('h3:first');
        //var parentID = parentSubHeading.length === 1 ? parentSubHeading.attr('id') : sectionID;
        //$example.attr('data-parent-section', parentID);

        return exampleID;
    };

    return new Sections();
});