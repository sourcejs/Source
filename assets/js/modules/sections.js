/*
 *
 * Sections modules
 *
 * @author Alexey Ostrovsky
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
    }

    Sections.prototype = module.createInstance();
    Sections.prototype.constructor = Sections;

    Sections.prototype.scanDOM = function () {
        var _this = this;
        $("." + this.getOptions().SECTION_CLASS).each(function (index, elem) {
            var section = $(elem);
            var headerElement = section.find("h2:first");

            var subHeaders = _this.findSubHeaders(section);
            var subHeaderElements = [];

            for (var i=0; i < subHeaders.length; i++) {
                var targetSubHeader = subHeaders[i];

                subHeaderElements[subHeaderElements.length] = $(targetSubHeader);
            }

            var sect = {
                num: index + 1,
                id: _this.setSectionId(section, index + 1),
                caption: headerElement.text(),
                sectionElement: section,
                headerElement: headerElement,
                subHeaderElements: subHeaderElements
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
    Sections.prototype.setSectionId = function (section, id) {
        var _id = id;
        var custom;

        if (section.attr('id') !== undefined) {
            custom = section.attr('id');
        } else {
            section.attr('id', _id);
        }

        section.children('h3').each(function(index) {
            if ($(this).attr('id') === undefined) {
                $(this).attr('id', _id + '.' + (index+1));
            }
        });

        return custom || _id;
    };
    
    
    /**
     * Checking if h3 is not in source
     *
     * @param section
     * @returns {jQuery}
     */
    Sections.prototype.findSubHeaders = function (section) {
        var h3;

        h3 = section.find("h3");

        if (h3.length !== 0 && h3.parents('.source_example').length === 0) {
            return h3;
        }
        return $();
    };

    return new Sections();
});
