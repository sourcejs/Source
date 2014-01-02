/*
*
* Media-queries helper
*
* @author Evgeniy Khoroshilov
*
* */

define([
    "core/options",
    "modules/codeSource"
    ], function(options) {

    var EXAMPLE_CLASS = options.exampleSectionClass,
        L_EXAMPLE_CLASS = $('.'+EXAMPLE_CLASS);

    //trim spaces between html tags in example sections
    $.fn.trimSpaces = function () {
        $(this).each(function () {
            var elem = $(this);
            if (elem.children().length) {
                elem.contents()
                        .filter(function () {
                            return this.nodeType === 3 && !/\S/.test(this.nodeValue)
                        })
                        .filter(function () {
                            return !/\xa0/.test(this.nodeValue)
                        }).remove().end()
                        .filter(function () {
                            return  /\xa0/.test(this.nodeValue)
                        }).replaceWith('&nbsp;');
                elem.children().trimSpaces();
            }
        });
        return this;
    };

    L_EXAMPLE_CLASS.trimSpaces();

});