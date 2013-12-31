/*
*
* Fold sections to optimize page load
*
* @author Robert Haritonov (http://rhr.me)
*
* */

define([
    "jquery",
    "core/options",
    "modules/utils",
    "modules/browser",
    "modules/sections",
    "modules/innerNavigation"
    ], function($, options, utils, browser, sections, innerNavigation) {

    $(function(){

        //TODO: move to utils
            // Bulletproof localStorage check
            var
                    storage,
                    fail,
                    uid;
            try {
                uid = new Date;
                (storage = window.localStorage).setItem(uid, uid);
                fail = storage.getItem(uid) != uid;
                storage.removeItem(uid);
                fail && (storage = false);
            } catch (e) {
            }

            //is element rendered
            var rendered = function (selector, handler) {
                var c = 0;

                var interval = setInterval(function () {
                    var offset = $(selector).offset();

                    if (offset.left > 0 || offset.top > 0) {
                        clearInterval(interval);
                        handler();
                    }
                    c++;
                }, 500);
            };
        //TODO: /move to utils

        var
                CONTAINER_CLASS = options.containerClass,
                    L_CONTAINER_CLASS = $('.'+CONTAINER_CLASS),

                SECTION_CLASS = options.SECTION_CLASS,
                    L_SECTION_CLASS = $('.'+SECTION_CLASS),

                EXAMPLE_CLASS = options.exampleSectionClass,
                    L_EXAMPLE_CLASS = $('.'+EXAMPLE_CLASS),

                OPEN_SECTION_CLASS = 'source_section__open',

                sectionsOnPage = L_SECTION_CLASS,
                specName = utils.getSpecName(), //Определяем название спеки
                clientConfig = {},

                RES_HIDE_SECTIONS = 'Hide all sections';

        if (storage) {
            //Check if localstorage has required data
            if (typeof localStorage.getItem('LsClientConfig') === 'string') { //LocalStorage can store only strings

                //Using JSON for passing array through localStorage
                clientConfig = $.parseJSON(localStorage.getItem('LsClientConfig'));

            } else {
                try {
                    localStorage.setItem('LsClientConfig', JSON.stringify(clientConfig));
                } catch (e) {
                }
            }
        }

        //Preparing config
        if (typeof clientConfig[specName] != 'object') {
            clientConfig[specName] = {};
            clientConfig[specName].closedSections = {};
        } else if (typeof clientConfig[specName].closedSections != 'object') {
            clientConfig[specName].closedSections = {};
        }

        /*

        Config must look like:
        clientConfig = {
            covers: {
                closedSections: {
                    section1: true,
                    section2: true
                }
            }
        }

        */

        var closedSections = clientConfig[specName].closedSections;

        var updateConfig = function () {
            try {
                localStorage.setItem('LsClientConfig', JSON.stringify(clientConfig));
            } catch (e) {
            }
        };

        var openSpoiler = function (t, config) {
        	if (t.is('h3')) {
        		t = t.closest('.source_section');
        	}
            t.addClass(OPEN_SECTION_CLASS);

            var sectionID = t.attr('id'),
                isRendered = false;

            closedSections["section" + sectionID] = false;

            if (config) { //Remember options in localStorage
                updateConfig();
            }

            // TODO: remove mustache check from core
            if (options.pluginsOptions.mustache) {
                // Need to use absolute path to get same scope with requires from inline scripts
                require(['/plugins/mustache/js/mustache.js'], function(templater){
                    if (typeof templater.PostponedTemplates != 'undefined') {

                        if (t.attr('data-rendered') === 'true') {
                            isRendered = true;
                        }

                        if (!isRendered) {

                            for (var arr in templater.PostponedTemplates[sectionID]) {
                                var a = templater.PostponedTemplates[sectionID][arr][0],
                                    b = templater.PostponedTemplates[sectionID][arr][1],
                                    c = templater.PostponedTemplates[sectionID][arr][2];

                                templater.insertTemplate(a, b, c);
                            }

                            t.attr('data-rendered', 'true');
                        }

                    }
                });
            }

        };

        var closeSpoiler = function (t, config) {
            t.removeClass(OPEN_SECTION_CLASS);

            var tID = t.attr('id');

            closedSections["section" + tID] = true;

            if (config) {
                updateConfig();
            }
        };


        var navHash = utils.parseNavHash();

        var sectionsCount = sectionsOnPage.length;

        for (var i = 0; i < sectionsCount; i++) {
            var t = $(sectionsOnPage[i]),
                    tID = t.attr('id');

            //Check from local storage config
            if (closedSections["section" + tID]) {
                t.attr('data-def-stat', 'closed');
            }

            //Open all unclosed by confing spoilers and scroll to hash targeted section
            //For ie < 8 all sections closed by default
            if (t.attr('data-def-stat') != 'closed' && !($.browser.msie && parseInt($.browser.version) < 8)) {
               openSpoiler(t);
            }
        }

        if (navHash != '') {
            openSpoiler($(navHash));
        }

        //To open sections on from inner navigation
        var openOnNavigation = function() {
            var
                navHash = utils.parseNavHash();

            openSpoiler($(navHash));

            //Close other closed by default sections
            for (var i = 0; i < sectionsOnPage.length; i++) {
                var
                    t = $(sectionsOnPage[i]),
                    tID = t.attr('id');

                if (t.attr('data-def-stat') === 'closed' && navHash != '#' + tID) {
                    closeSpoiler(t);
                }
            }

            if (navHash != '') {
                utils.scrollToSection(navHash);
            }
        }

        //If supports history API
        if (window.history && history.pushState && !$.browser.msie)  {
            window.addEventListener('popstate', function (event) {
                openOnNavigation();
            });
        } else {
            $('.source_main_nav_a').on({
                'click': function(e) {
                    e.preventDefault();

                    //Imitate hash change on click
                    var href = $(this).attr('href');

                    href = href.split('#');
                    href = href[href.length - 1];

                    window.location.hash = href;

                    openOnNavigation();

                }
            });
        }

        var toggleSpoiler = function (t) {
            if (t.hasClass(OPEN_SECTION_CLASS)) {
                closeSpoiler(t, true);
            } else {
                openSpoiler(t, true);
            }
        };

        for(var j = 0; j < sections.getQuantity(); j++) {
            sections.getSections()[j].headerElement
                    .addClass("source_section_h")
                    .append('<a href="#" onclick="return false" class="source_section_h_expand"></a>');
        }

        $('.source_section_h_expand').on({
            'click':function () {
                t = $(this).closest('.source_section');
                toggleSpoiler(t);
            }
        });

        innerNavigation.addMenuItem(RES_HIDE_SECTIONS, function(){
            for (var i = 0; i < sectionsOnPage.length; i++) {
                var t = $(sectionsOnPage[i]);
                closeSpoiler(t, true);
            }
        }, function(){
            for (var i = 0; i < sectionsOnPage.length; i++) {
                var t = $(sectionsOnPage[i]);
                openSpoiler(t, true);
            }
        });

    });

});