/*
*
* Media-queries helper
*
* @author Evgeniy Khoroshilov
*
* */

sourcejs.amd.define([
    'jquery',
    'source/load-options',
    'sourceModules/codeSource'
    ], function($, options) {

    'use strict';

    var EXAMPLE_CLASS = options.exampleSectionClass;
    var L_EXAMPLE_CLASS = $('.'+EXAMPLE_CLASS);

    //trim spaces between html tags in example sections
    $.fn.trimSpaces = function () {
        $(this).each(function () {
            var elem = $(this);
            var regex = new RegExp("\xa0");
            if (elem.children().length) {
                elem.contents()
                        .filter(function () {
                            return this.nodeType === 3 && !/\S/.test(this.nodeValue);
                        })
                        .filter(function () {
                            return !regex.test(this.nodeValue);
                        }).remove().end()
                        .filter(function () {
                            return  regex.test(this.nodeValue);
                        }).replaceWith('&nbsp;');
                elem.children().trimSpaces();
            }
        });
        return this;
    };

    L_EXAMPLE_CLASS.trimSpaces();
});
