'use strict';

sourcejs.amd.define([
    "jquery",
    "sourceModules/module",
    "sourceModules/utils",
    "sourceModules/sections",
    "sourceModules/headerFooter",
    "text!sourceTemplates/nav.inc.html",
    "text!sourceTemplates/navActionItem.inc.html",
    "text!sourceTemplates/navActionTumbler.inc.html"], function ($, module, utils, sections, headerFooter, navTemplate, menuItemTemplate, menuItemTumblerTemplate) {

    function InnerNavigation() {
        var _this = this;

        this.options.modulesOptions.innerNavigation = $.extend({}, {
            NAV_UL_CLASS: 'source_main_nav_ul',
            NAV_UL_SECONDLEVEL_CLASS: 'source_main_nav_ul2',
            NAV_LI_CLASS: 'source_main_nav_li',
            NAV_LI_SECONDLEVEL_CLASS: 'source_main_nav_li2',
            NAV_LINK_CLASS: 'source_main_nav_a',
            MENU__I_CLASS: 'source_main_nav_i',
            MENU_SCROLL_MOD_CLASS: '__menuScroll',
            MAIN_NAV_AC: 'source_main_nav_ac',
            MAIN_NAV_AC_TX: 'source_main_nav_ac_tx',
            INJECT_AFTER: '.source_main h1',
            RESERVED_HEIGHT: 250 // (185 + 15 + 50) px
        }, this.options.modulesOptions.innerNavigation);
        this.moduleOptions = this.options.modulesOptions.innerNavigation;

        this.menuItemTemplate = $(menuItemTemplate);
        this.menuItemTumblerTemplate = $(menuItemTumblerTemplate);
        this.container = $(navTemplate);

        var $injectAfter = $(this.moduleOptions.INJECT_AFTER).first();

        // Checking if inject after element exists, and isn't used in source example sections
        if (
            $injectAfter.length !== 0 &&
            $injectAfter.parents('.'+this.options.exampleSectionClass).length === 0 &&
            $injectAfter.parents('.'+this.options.exampleCleanClass).length === 0
        ) {
            $injectAfter.after(this.container);
        } else {
            $('.'+this.options.mainClass).prepend(this.container);
        }

        $(function () {
            _this.injectNavigation();
            _this.calcMenuHeight();
            _this.bindEvents();
        });
    }

    InnerNavigation.prototype = module.createInstance();
    InnerNavigation.prototype.constructor = InnerNavigation;

    //className is optional
    InnerNavigation.prototype.addMenuItem = function (text, onCallback, offCallback, className) {
        var newItem = this.menuItemTumblerTemplate.clone();

        if (typeof className === 'string' && className !== '') {
            newItem.addClass(className);
        }

        newItem.find(".source_slider_frame").click(function (e) {
            e.preventDefault();

            var isEnabled = $(this).hasClass("source_slider_frame__on");
            isEnabled = !Boolean(isEnabled);

            $(this).toggleClass("source_slider_frame__on");

            if (isEnabled) {
                onCallback();
            } else {
                offCallback();
            }
        });

        newItem.find('.' + this.moduleOptions.MAIN_NAV_AC_TX).text(text);
        $('.' + this.moduleOptions.MAIN_NAV_AC).append(newItem);

        // recalculate height after adding new action to menu
        $(window).trigger('resize');
    };

    //className is optional
    InnerNavigation.prototype.addMenuItemSimple = function (text, actionsArr, ctx, className) {
        var newItem = this.menuItemTemplate.clone();

        if (typeof className === 'string' && className !== '') {
            newItem.addClass(className);
        }

        actionsArr.forEach(function(action, index){
            var $link = $('<a class="source_main_nav_ac-simple" href="#7"></a>');

            $link.text(action.name);

            $link.on('click', function(e){
                e.preventDefault();

                if (ctx) {
                    action.callback.apply(ctx);
                } else {
                    action.callback();
                }
            });

            newItem.find('.source_main_nav_ac-list').append($link);

            if (index !== actionsArr.length - 1){
                newItem.find('.source_main_nav_ac-list').append(' / ');
            }
        });

        newItem.find('.' + this.moduleOptions.MAIN_NAV_AC_TX).text(text);
        $('.' + this.moduleOptions.MAIN_NAV_AC).prepend(newItem);

        // recalculate height after adding new action to menu
        $(window).trigger('resize');
    };

    InnerNavigation.prototype.toggleMenuItem = function (id) {
        $('.'+id+' .source_slider_frame').toggleClass("source_slider_frame__on");
    };

    InnerNavigation.prototype.bindEvents = function () {
        var _this = this;

        $(window).on('resize',function () {
            _this.addMenuScrolling();
        }).trigger('resize');
    };

    InnerNavigation.prototype.calcMenuHeight = function () {
        var h = 0;

        this.container.find('.' + this.moduleOptions.MENU__I_CLASS).each(function () {
            h += $(this).height();
        });

        return h;
    };

    InnerNavigation.prototype.injectNavigation = function () {
        var appendString = '';
        for (var i = 0; i < sections.getQuantity() ; i++) {
            var section = sections.getSections()[i];
            var sectionID = i + 1;
            var href = (section.id);

            appendString += [
                '<li class="' + this.moduleOptions.NAV_LI_CLASS + '">',
                    '<a href="#' + href + '" class="' + this.moduleOptions.NAV_LINK_CLASS + '">',
                        section.num + '. ' + section.caption,
                    '</a>'
            ].join('');

            if ( section.subHeaderElements !== undefined ) {
                appendString += '<ul class="' + this.moduleOptions.NAV_UL_SECONDLEVEL_CLASS + '">';

                for (var j = 0; j < section.subHeaderElements.length; j++) {
                    var seqNum = j+1;
                    var subSection = section.subHeaderElements[j];
                    var subSectionID = sectionID + '.' + seqNum;
                    var subHref = subSection.attr('id') || subSectionID;

                    appendString += [
                        '<li class="' + this.moduleOptions.NAV_LI_SECONDLEVEL_CLASS + '">',
                            '<a class="source_main_nav_a" href="#' + subHref + '">',
                                section.num + '.' + seqNum + '&nbsp;' + subSection.text(),
                            '</a>',
                        '</li>'
                    ].join('');
                }

                appendString += '</ul>';
            }

            appendString += '</li>';
        }

        $('.' + this.moduleOptions.NAV_UL_CLASS).append(appendString);
    };

    //TODO: refactor menu scrolling add
    InnerNavigation.prototype.addMenuScrolling = function () {
        if (this.calcMenuHeight() + this.moduleOptions.RESERVED_HEIGHT > $(window).height()) {
            this.container.addClass(this.moduleOptions.MENU_SCROLL_MOD_CLASS);
        } else {
            this.container.removeClass(this.moduleOptions.MENU_SCROLL_MOD_CLASS);
        }
    };

    return new InnerNavigation();

});
