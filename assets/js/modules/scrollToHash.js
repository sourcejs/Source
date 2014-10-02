//In separate module, to trace script ready state
define([
    "jquery",
    "sourceModules/utils",
    "sourceModules/loadEvents",
    "sourceModules/sectionFolding"
    ], function($, utils, loadEvents) {

    'use strict';

    var navHash = utils.parseNavHash();
    var $sections = $('.source_section');
    var $navigation = $('.source_nav');
    var $mainContainer = $('.source_main');
    var $body = $('body');

    // Show hidden sections and navigation
    function showSections() {
        $sections.addClass('__loaded');
        $navigation.addClass('__loaded');
        $mainContainer.removeClass('__loading');
        $body.removeClass('__loading');
    }

    $mainContainer.addClass('__loading');
    $body.addClass('__loading');

    loadEvents.init(function() {
        showSections();

        // Chrome scroll bug
        if ($('html').hasClass('webkit')) {

            var t = setInterval(function() {
                if (window.pageYOffset !== 0) {
                    clearInterval(t);
                }

                window.scrollTo(0, 1);
                utils.scrollToSection(navHash);
            }, 100);
        } else {
            utils.scrollToSection(navHash);
        }
    });

});