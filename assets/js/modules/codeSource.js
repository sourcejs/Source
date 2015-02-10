/*
 *
 * View demo-examples source code
 *
 * */

define([
    "jquery",
    "source/load-options",
    "sourceModules/utils",
    "sourceModules/css",
    "sourceModules/browser",
    "sourceModules/exampleTabs",
    "sourceModules/sections",
    "sourceLib/codeFormat",
    "sourceModules/innerNavigation",
    "sourceVendor/prism/prism"
], function($, options, utils, Css, browser, exampleTabs, sections, codeFormat, innerNavigation) {
    'use strict';

    $(document).ready(function() {
        var SourceCode = 'source_source-code';
        var SourceCodeShow = SourceCode + '__show';
        var SourceCodeMin = SourceCode + '__min';

        var SourceCodeToggle = 'source_source-code_toggle';

        var SourceCodeToggleAll = 'source_source-code_toggle-all';
        var SourceCodeToggleAllHide = SourceCodeToggleAll + '__hide';

        var RES_TOGGLER_SHOW_CODE = 'Show source';

        var urlConfig = 'sc';

        var prepared = false;


        // Add HTML source code container before each example without it
        $('.source_example').each(function () {
            var $this = $(this);

            // <code class="src-*">...</code> is the wrapper for prism.js plugin
            if (!($this.prev().hasClass('src-html') && ($.trim($this.prev().html()) === ''))) {
                $this.before('<code class="src-html" style="display:none"></code>');
            }
        });

        var wrapTags = function() {
            sections.sections.forEach(function (item) {
                Object.keys(item.examples).forEach(function (exItem) {
                    var targetExample = item.examples[exItem];
                    var $codeConainers = targetExample.$el.prevUntil('*:not(code)');
                    var i = 1;

                    $codeConainers.each(function(){
                        var $this = $(this);
                        var codeID = targetExample.id + '-code-' + i;
                        i++;

                        if (!$this.parent().is('pre')) {
                            $this.html().trim();
                            $this.wrap('<pre id="'+codeID+'"></pre>');
                        }

                        if ($this.hasClass('src-html')) {
                            var HTMLcode = $this.html();
                            $this.html(HTMLcode.replace(/</g, "&lt;").replace(/>/g,"&gt;"));
                        }

                        $this.parent()
                            .attr('class', 'source_source-code ' + $this.attr('class'))
                            .attr('style', 'display:none');

                        $this[0].removeAttribute('class');
                    });
                });
            });
        };

        // Code show toggle on each code block
        var prepareCodeBlocks = function() {
            var selection = $('.source_section pre[class*="src-"] > code');

            console.log('selection', selection);


            selection.each(function() {
                var _this = $(this);

                console.log(_this[0]);

                Prism.highlightElement(_this[0]);
            });
        };

        var fillCodeContainers = function() {
            //Auto copy HTML in code.html if it's now filled
            var selection = $('.source_section pre[class*="src-"].source_visible > code');
            selection.each(function () {
                var _this = $(this), HTMLcode;

                if (_this.html().trim().length === 0) {
                    HTMLcode = _this.parent().nextAll('.'+ options.EXAMPLE_CLASS ).html();
                    _this.html(HTMLcode);
                    if (_this.parent().hasClass('src-html')) {
                        _this.formatify();
                    }
                }
                else {
                    HTMLcode = _this.html();
                    var spaces = HTMLcode.replace(/\t/,'  ').match(/^\s{0,}/)[0].length;
                    var HTMLarray = HTMLcode.trim().split("\n");
                    for (var i=0; i<HTMLarray.length;i++) {
                        HTMLarray[i] = HTMLarray[i].replace(new RegExp(' {'+(spaces-1)+'}'), '');
                    }
                    HTMLcode = HTMLarray.join('\n').replace(/\s{1,}<span class="line-num/g, '<span class="line-num');

                    _this.html(HTMLcode);
                }
            });
        };

        var afterActivation = function() {
            var sources = $('.' + SourceCode);
            sources.addClass(SourceCodeShow);

            //Scroll to section
            var navHash = utils.parseNavHash();
            utils.scrollToSection(navHash);
        };

        //Toggle show source sections
        var initCodePartToggler = function() {
            $('.source_container').on('click', '.' + SourceCodeToggle, function (e) {
                e.preventDefault();
                var codeCnt = $(this).closest('.' + SourceCode);
                codeCnt.toggleClass(SourceCodeMin);
            });
        };

        //Show / hide source
        var showAllCode = function () {
            if (!prepared) {
                fillCodeContainers();
                prepareCodeBlocks();
                $('pre').removeAttr('style');
                prepared = true;
            }
            afterActivation();

            //TODO: finish url update on code show toggle functionality
//                var updateHref = hash === '' ? '!sc' : hash + urlConfig;
//                window.location.hash = updateHref;
        };

        var showStaticCode = function () {
            wrapTags();
            fillCodeContainers();
            prepareCodeBlocks();
            initCodePartToggler();
            $('pre[class*="src-"] > code').addClass('__visible');
            $('pre.source_visible').removeAttr('style');
        };

        var hideAllCode = function () {
            $('.' + SourceCode).removeClass(SourceCodeShow);
            $('.' + SourceCodeToggleAll).removeClass(SourceCodeToggleAllHide);

            //Scroll to section
            var navHash = utils.parseNavHash();
            utils.scrollToSection(navHash);
        };

        //if ($('pre:not(.source_visible)')[0]) {
            innerNavigation.addMenuItem(RES_TOGGLER_SHOW_CODE, showAllCode, hideAllCode);
        //}

//          If url has '!sc', show source code by default
        var getUrlParam = document.location.href.split(options.modulesOptions.innerNavigation.hashSymb);

        getUrlParam = getUrlParam[getUrlParam.length - 1];

        if (getUrlParam === urlConfig) {
            $(document).ajaxStop(function() {
                $('.source_main_nav_ac_tx:contains("'+RES_TOGGLER_SHOW_CODE+'")').next('.source_slider_frame').addClass('source_slider_frame__on');
                showAllCode();
            });
        }

        showStaticCode();
    });
});