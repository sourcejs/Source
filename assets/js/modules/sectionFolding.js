/*
*
* Fold sections to optimize page load
*
* @author Robert Haritonov (http://rhr.me)
*
* */

sourcejs.amd.define([
    "jquery",
    "source/load-options",
    "sourceModules/utils",
    "sourceModules/browser",
    "sourceModules/sections",
    "sourceModules/innerNavigation"
    ], function($, options, utils, browser, sections, innerNavigation) {

    'use strict';

    $(function(){

        //TODO: move to utils
        // Bulletproof localStorage check
        var storage;
        var fail;
        var uid;
        try {
            uid = new Date();
            (storage = window.localStorage).setItem(uid, uid);
            fail = storage.getItem(uid) !== uid.toString();
            storage.removeItem(uid);
            fail && (storage = false);
        } catch (e) {
        }
        //TODO: /move to utils
        var SECTION_CLASS = options.SECTION_CLASS;
        var L_SECTION_CLASS = $('.'+SECTION_CLASS);
        var OPEN_SECTION_CLASS = 'source_section__open';
        var sectionsOnPage = L_SECTION_CLASS;
        var specName = utils.getSpecName(); //Определяем название спеки
        var clientConfig = {};
        var RES_HIDE_SECTIONS = 'Hide all sections';

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
        if (typeof clientConfig[specName] !== 'object') {
            clientConfig[specName] = {};
            clientConfig[specName].closedSections = {};
        } else if (typeof clientConfig[specName].closedSections !== 'object') {
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

        var openSpoiler = function ($target, config) {
            if ($target.is('h3')) {
                $target = $target.closest('.source_section');
            }
            $target.addClass(OPEN_SECTION_CLASS);

            var sectionID = $target.attr('id');

            closedSections["section" + sectionID] = false;

            if (config) { //Remember options in localStorage
                updateConfig();
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
            var $this = $(sectionsOnPage[i]);
            var tID = $this.attr('id');

            //Check from local storage config
            if (closedSections["section" + tID]) {
                $this.attr('data-def-stat', 'closed');
            }

            //Open all unclosed by confing spoilers and scroll to hash targeted section
            //For ie < 8 all sections closed by default
            if ($this.attr('data-def-stat') !== 'closed' && !(browser.msie && parseInt(browser.version, 10) < 8)) {
               openSpoiler($this);
            }
        }

        if (navHash !== '') {
            openSpoiler($(navHash));
        }

        //To open sections on from inner navigation
        var openOnNavigation = function() {
            var navHash = utils.parseNavHash();

            openSpoiler($(navHash));

            //Close other closed by default sections
            for (var i = 0; i < sectionsOnPage.length; i++) {
                var t = $(sectionsOnPage[i]);
                var tID = t.attr('id');

                if (t.attr('data-def-stat') === 'closed' && navHash !== '#' + tID) {
                    closeSpoiler(t);
                }
            }

            if (navHash !== '') {
                utils.scrollToSection(navHash);
            }
        };

        //If supports history API
        if (window.history && history.pushState && !browser.msie)  {
            window.addEventListener('popstate', function (event) {
                openOnNavigation();
            });
        } else {
            $('.source_main_nav_a').on({
                click: function(e) {
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
            click:function () {
                $this = $(this).closest('.source_section');
                toggleSpoiler($this);
            }
        });

        innerNavigation.addMenuItem(RES_HIDE_SECTIONS, function(){
            for (var i = 0; i < sectionsOnPage.length; i++) {
                closeSpoiler($(sectionsOnPage[i]), true);
            }
        }, function(){
            for (var i = 0; i < sectionsOnPage.length; i++) {
                openSpoiler($(sectionsOnPage[i]), true);
            }
        });

    });

});
