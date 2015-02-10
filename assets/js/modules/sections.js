/*
 *
 * Sections modules
 *
 * @author Alexey Ostrovsky, Robert Haritonov
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

        $("." + _this.options.SECTION_CLASS).each(function (index, elem) {
            var sectionID = index + 1;
            var $section = $(elem);
            var $header = $section.find("h2:first");

            var $subHeaders = $section.find("h3");
            var subHeaderElements = [];

            var $examples = $section.find("." + _this.options.EXAMPLE_CLASS);
            var examples = {};


            // Processing examples
            for (var j=0; j < $examples.length; j++) {
                var $targetExample = $($examples[j]);
                var exampleNum = j + 1;
                var exampleID = 'sec-' + sectionID + '-ex-' + exampleNum;

                examples[exampleNum] = {
                    $el: $targetExample,
                    id: _this.setExampleId($targetExample, exampleID)
                };
            }

            // Processing sub headers h3
            for (var i=0; i < $subHeaders.length; i++) {
                var targetSubHeader = $subHeaders[i];

                subHeaderElements[subHeaderElements.length] = $(targetSubHeader);
            }

            var sect = {
                num: sectionID,
                id: _this.setSectionId($section, sectionID),
                caption: $header.text(),
                sectionElement: $section,
                headerElement: $header,
                subHeaderElements: subHeaderElements,
                examples: examples
            };

            _this.addSection(sect);
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
    Sections.prototype.setSectionId = function ($section, id) {
        var _id = id;
        var custom;

        if ($section.attr('id') !== undefined) {
            custom = $section.attr('id');
        } else {
            $section.attr('id', _id);
        }

        $section.children('h3').each(function(index) {
            if ($(this).attr('id') === undefined) {
                $(this).attr('id', _id + '.' + (index+1));
            }
        });

        return custom || _id;
    };

    // Adding unique ID to example, if it's present
    Sections.prototype.setExampleId = function ($example, id) {
        var _id = id;
        var custom;

        if ($example.attr('id') !== undefined) {
            custom = $example.attr('id');
        } else {
            $example.attr('id', _id);
        }

        return custom || _id;
    };

    return new Sections();
});