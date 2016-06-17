//In separate module, to trace script ready state
sourcejs.amd.define([
    "jquery",
    "sourceModules/utils",
    "sourceModules/loadEvents",
    "sourceModules/sectionFolding"
    ], function($, utils, loadEvents) {

    'use strict';

    $(function(){
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

            // FF scroll bug, related native to scroll to hash conflicts
            if ($('html').hasClass('mozilla')) {
                var triesCount = 0;

                var t = setInterval(function() {
                    var scrollTopCord = utils.scrollToSection(navHash);

                    if (window.pageYOffset === scrollTopCord || triesCount < 4) {
                        clearInterval(t);
                    } else {
                        triesCount++;
                    }
                }, 300);
            } else {
                utils.scrollToSection(navHash);
            }
        });
    });
});
