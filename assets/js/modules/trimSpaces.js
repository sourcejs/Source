/*
*
* Trim spaces, new lines and tabs from HTML string
*
* */

define([
    "jquery",
    "sourceModules/module"
    ], function($, module) {

    'use strict';

    function TrimSpaces() {
        if (this.options.modulesEnabled.trimSpaces) {
            this.trimExamples();
        }

        return this;
    }

    TrimSpaces.prototype = module.createInstance();
    TrimSpaces.prototype.constructor = TrimSpaces;

    /**
     * @method trimExamples. Trims spaces in all example containers.
     */
    TrimSpaces.prototype.trimExamples = function () {
        var _this = this;
        var $examples = $('.' + this.options.EXAMPLE_CLASS);

        $examples.each(function () {
            $(this).html(_this.trimHTML($(this).html()));
        });
    };

    /**
     * @method trimHTML. Trims spaces, new lines and tabs from HTML string.
     *
     * @param {String} html - HTML string
     *
     * @returns {String} trimmed HTML
     */
    TrimSpaces.prototype.trimHTML = function (html) {
        return html.trim().replace(new RegExp( ">[\n\t ]+<" , "g" ) , "><");
    };

    return new TrimSpaces();
});