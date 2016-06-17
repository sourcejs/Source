/*
*
* Navigation scroll highlighter
*
* @author Ivan Metelev (http://welovehtml.ru)
*
* */


sourcejs.amd.define([
    'jquery',
    'sourceModules/module'
    ], function ($, module) {
    'use strict';

    function NavHighlight() {
        var defaults = {
            updateHash: true
        };

        this.options.modulesOptions.navHighlight = $.extend(true, defaults, this.options.modulesOptions.navHighlight);
        this.conf = this.options.modulesOptions.navHighlight;

        this.init();
    }

    NavHighlight.prototype = module.createInstance();
    NavHighlight.prototype.constructor = NavHighlight;

    NavHighlight.prototype.init = function(){
        var _this = this;

        // basic utils
        var utils = (function() {

            return {
                offsetTop: function(elem) {
                    var box = elem.getBoundingClientRect();
                    var clientTop = document.body.clientTop || 0;
                    var top = box.top +  window.pageYOffset - clientTop;

                    return Math.round(top);
                },
                hasClass: function(elem, cls) {
                    if (elem !== null) {
                        return elem.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
                    } else {
                        return false;
                    }
                },
                addClass: function(elem, cls) {
                    if (!this.hasClass(elem,cls)) {
                        elem.className += " "+cls;
                        elem.className.replace(/ +/g,' ');
                    }
                },
                removeClass: function(elem, cls) {
                    if (this.hasClass(elem,cls)) {
                        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
                        elem.className=elem.className.replace(reg,'');
                    }
                },
                closest: function(elem, cls) { //console.log(elem, cls);
                    if (elem.tagName === 'html') return false;

                    var elemParent = elem.parentNode;
                    if (!utils.hasClass(elem, cls)) {
                        return utils.closest(elemParent, cls);
                    }

                    return elem;
                }
            };

        })();

        var sourceHeaders = [];
        var navHeaders;
        var currentHeader = -1;
        var filename = '';
        var extension = '';
        var hashThreshold = 100;

        var fullFilename = window.location.href.split("#")[0].split('/').pop().split('.');

        //update extension and filename only if there is one in URL
        if(fullFilename.length !== 1) {
            extension = /\w+/.exec(fullFilename[1]);
            filename = fullFilename[0];
        }

        // watch headers position
        var watchSectionTop = function () {

            var headersLength = sourceHeaders.length;
            var minDistance = Number.MAX_VALUE;
            var closestHeader = -1;
            var fileNameInUrl = filename === '' ? '' : filename + '.' +  extension;

            if ((document.body.scrollTop || document.documentElement.scrollTop) < hashThreshold) {

                if (!!window.location.hash)    {
                    currentHeader = -1;
                    if (!!(window.history && history.pushState)) {
                        window.history.replaceState({anchor: 0}, document.title, window.location.pathname);
                    }
                }

                return;
            }

            // catch section which is closed for top window border
            for (var i=0; i < headersLength; i++) {

                if ((sourceHeaders[i].tagName === 'H3') && (!utils.hasClass(utils.closest(sourceHeaders[i], 'source_section'), 'source_section__open')) ) {
                    continue;
                }

                var currentDist = Math.abs( utils.offsetTop(sourceHeaders[i]) - 60 - window.pageYOffset ); //60 = Header heights
                if (currentDist < minDistance) {
                    closestHeader = i;
                    minDistance = currentDist;
                }
            }

            if (closestHeader !== currentHeader) {
                utils.removeClass( document.querySelector('.source_main_nav_li.__active'), '__active');
                utils.removeClass( document.querySelector('.source_main_nav_a.__active'), '__active');

                utils.addClass(navHeaders[closestHeader], '__active');

                var parent = utils.closest(navHeaders[closestHeader], 'source_main_nav_li');
                var hashFromLink = navHeaders[closestHeader].getAttribute('href');

                if (!!parent && parent) {
                    utils.addClass(parent, '__active');
                }

                if (_this.conf.updateHash) {
                    // TODO: pause hash change when scrolling - append it only on stand-still

                    // Modern browsers uses history API for correct back-button-browser functionality
                    if (!!(window.history && history.pushState)) {
                        window.history.replaceState({anchor: closestHeader+1}, document.title, fileNameInUrl + hashFromLink);
                    } else { // ie9 fallback
                         window.location.hash = hashFromLink;
                    }
                }

                currentHeader = closestHeader;
            }
        };

        // watch navmenu render
        var checkNavInterval;
        var h2Nodes;
        var bodyNode = document.querySelector('body');
        var checkOnNav = function checkOnNav() {

            if ((document.querySelector('.source_section') !== null) &&
                (document.querySelector('.source_main_nav_a') !== null)) {

                clearInterval(checkNavInterval);

                navHeaders = document.querySelectorAll('.source_main_nav_a');
                h2Nodes = document.querySelectorAll('.source_section');

                var getH3Nodes = function(childerArray){
                    var h3Nodes = [];

                    childerArray.forEach(function (item) {
                        if (item.tagName === 'H3') h3Nodes.push(item);
                    });

                    return h3Nodes;
                };

                for (var h2 = 0; h2 < h2Nodes.length; h2++) {
                    var childerArray = [].slice.call(h2Nodes[h2].children);

                    var h3Nodes = getH3Nodes(childerArray);

                    sourceHeaders.push( h2Nodes[h2].querySelector('h2') );
                    for (var h3 = 0; h3 < h3Nodes.length; h3++) {
                        sourceHeaders.push( h3Nodes[h3] );
                    }

                }

                if (utils.hasClass(bodyNode, 'source__scrolled-down')) {
                    watchSectionTop();
                }

                window.onscroll = function() {
                    watchSectionTop();
                };

                return;
            }
        };

        checkNavInterval = setInterval(checkOnNav, 1000);
    };

    return new NavHighlight();
});
