define(["core/options","modules/browser"], function(options) {

    var
        SECTION_CLASS = options.SECTION_CLASS,
            L_SECTION_CLASS = $('.'+SECTION_CLASS),

//        EXAMPLE_CLASS = options.exampleSectionClass,
//            L_EXAMPLE_CLASS = $('.'+EXAMPLE_CLASS),

        SCROLLED_DOWN_MOD_CLASS = 'source__scrolled-down';

    //h3 decoration
    L_SECTION_CLASS.find('>h3').wrapInner('<span></span>');

    //IE layout fix
    if ($.browser.msie && parseInt($.browser.version) < 8) {
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