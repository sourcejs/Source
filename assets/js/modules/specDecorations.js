sourcejs.amd.define([
    "jquery",
    "source/load-options",
    "sourceModules/browser"
    ], function($, options, browser) {

    'use strict';

    var SECTION_CLASS = options.SECTION_CLASS;
    var L_SECTION_CLASS = $('.'+SECTION_CLASS);
    var SCROLLED_DOWN_MOD_CLASS = 'source__scrolled-down';
    //h3 decoration
    L_SECTION_CLASS.find('>h3').wrapInner('<span class="source_subsection_h"></span>');

    //IE layout fix
    if (browser.msie && parseInt(browser.version, 10) < 8) {
        //After demo section clear
        $('<div class="source_clear"></div>').insertAfter('.source_section > .source_example');
    }

    //Fading header on scroll down
    $(window).scroll(function () {
        if ($(window).scrollTop() > 50) {
            $('body').addClass(SCROLLED_DOWN_MOD_CLASS);
        }
        else {
            $('body').removeClass(SCROLLED_DOWN_MOD_CLASS);
        }
    }).trigger('scroll');

});
