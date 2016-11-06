/*
 *
 * View demo-examples source code
 *
 * */

sourcejs.amd.define([
    "jquery",
    "source/load-options",
    "sourceModules/utils",
    "sourceModules/css",
    "sourceModules/browser",
    "sourceLib/codeFormat",
    "sourceModules/innerNavigation",
    "sourceLib/prism/prism"
], function($, options, utils, Css, browser, codeFormat, innerNavigation, Prism) {
    'use strict';

    if (!(browser.msie && parseInt(browser.version, 10) < 9)) { // and if not ie < 9
        $(document).ready(function() {
            var SourceCode = 'source_source-code';
            var SourceCodeShow = SourceCode + '__show';
            var SourceCodeMin = SourceCode + '__min';
            var SourceCodeStatic = SourceCode + '__static';

            var SourceCodeCnt = 'source_source-code_cnt';

            var SourceCodeToggle = 'source_source-code_toggle';
            var SourceCodeToggleCSS = SourceCodeToggle + '__css';
            var SourceCodeToggleHTML = SourceCodeToggle + '__html';
            var SourceCodeToggleJS = SourceCodeToggle + '__js';

            var SourceCodeToggleAll = 'source_source-code_toggle-all';
            var SourceCodeToggleAllHide = SourceCodeToggleAll + '__hide';

            var RES_HIDE_CODE = 'Hide';
            var RES_SHOW_CODE = 'Show';
            var RES_CODE = 'code';
            var RES_TOGGLER_SHOW_CODE = 'Show source code';

            var prepared = false;
            var onlyStatic = true;


            //Add HTML source code container before each example without it
            $('.source_example').each(function () {
                var _this = $(this);

                // <pre class="src-*"><code>...</code></pre> is the wrapper for prism.js plugin
                if ( !_this.prev().hasClass('src-html') ) {
                    _this.before('<pre class="src-html" style="display:none"><code></code></pre>');
                }
            });

            var wrapTags = function() {
                // temporary solution while code:brush is still used, later this section will be removed
                $('.source_section').find('code[class*="brush"]').each(function () {

                    var _this = $(this);
                    var formatClass = 'src-';

                    if (_this.hasClass('css')) {
                        formatClass += 'css';
                    } else if (_this.hasClass('js')) {
                        formatClass += 'js';
                    } else if (_this.hasClass('json')) {
                        formatClass += 'json';
                    } else {
                        formatClass += 'html';
                    }

                    if (_this.hasClass('source_visible')) {
                        formatClass += ' source_visible ';
                    }

                    if (!_this.parent().is('pre')) {
                        _this.html().trim();
                        _this.wrap('<pre></pre>');
                    }

                    if (_this.hasClass('html')) {
                        var HTMLcode = _this.html();
                        _this.html(HTMLcode.replace(/</g, "&lt;").replace(/>/g,"&gt;"));
                    }

                    _this.parent()
                        .attr('class', formatClass)
                        .attr('style', 'display:none');

                    _this[0].removeAttribute("class");
                });

                // wrapper for new syntax: <code class="src-*"></code>
                $('.source_section').find('code[class*="src-"]').each(function () {
                    var _this = $(this);

                    if (!_this.parent().is('pre')) {
                        _this.html().trim();
                        _this.wrap('<pre></pre>');
                    }

                    if (_this.hasClass('src-html')) {
                        var HTMLcode = _this.html();
                        _this.html(HTMLcode.replace(/</g, "&lt;").replace(/>/g,"&gt;"));
                    }

                    _this.parent()
                        .attr('class', _this.attr('class'))
                        .attr('style', 'display:none');

                    _this[0].removeAttribute('class');
                });
            };

            //Code show toggle on each code block
            var prepareCodeBlocks = function() {
                new Css('/source/assets/js/lib/prism/prism.css', 'core');
                var selection = onlyStatic ? $('.source_section pre[class*="src-"].source_visible > code') : $('.source_section pre[class*="src-"] > code');
                selection.each(function () {
                    var _this = $(this);
                    var parent = _this.parent();
                    var langClass='';
                    if (!parent.hasClass('src-json')) {
                        if (parent.hasClass('src-css')) {
                            langClass = SourceCodeToggleCSS;
                        } else if (parent.hasClass('src-js')) {
                            langClass = SourceCodeToggleJS;
                        } else {
                            langClass = SourceCodeToggleHTML;
                        }
                        if (parent.hasClass('source_visible')) {
                            parent.wrap('<div class="'+SourceCode+' '+SourceCodeStatic+'"><div class="' + SourceCodeCnt + '"></div></div>');
                        }
                        else if (!parent.hasClass('src-json')) {
                            parent.wrap('<div class="'+SourceCode+'"><div class="' + SourceCodeCnt + '"></div></div>');
                            _this.closest('.' + SourceCode).prepend('' +
                                '<a href="" class="' + SourceCodeToggle + ' ' + langClass + '"><span class="source_hide">' + RES_HIDE_CODE + '</span><span class="source_show">' + RES_SHOW_CODE + '</span> ' + RES_CODE + '</a>' +
                                '');
                        }
                        Prism.highlightElement(_this[0]);
                    }
                });
            };
            var fillCodeContainers = function() {
                //Auto copy HTML in code.html if it's now filled
                var selection = onlyStatic ? $('.source_section pre[class*="src-"].source_visible > code') : $('.source_section pre[class*="src-"] > code');
                selection.each(function () {
                    var _this = $(this);
                    var HTMLcode;

                    if (_this.html().trim().length === 0) {
                        HTMLcode = _this.parent().nextAll('.'+ options.exampleSectionClass ).html();
                        _this.html(HTMLcode);

                        if (_this.parent().hasClass('src-html')) {
                            codeFormat(_this);
                        }
                    } else {
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
                var sources = $('.' + SourceCode).filter(function() {
                    return !$(this).next().hasClass('source_ignore');
                });
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
                    $('pre').filter(function() {
                        return !$(this).closest('.source_source-code').next().hasClass('source_ignore');
                    }).removeAttr('style');
                    prepared = true;
                }
                afterActivation();
            };

            var showStaticCode = function () {
                wrapTags();
                fillCodeContainers();
                prepareCodeBlocks();
                initCodePartToggler();
                onlyStatic = false;
                $('pre[class*="src-"] > code').addClass('__visible');
                $('pre.source_visible').removeAttr('style');

                //Scroll to section
                var navHash = utils.parseNavHash();
                utils.scrollToSection(navHash);
            };

            var hideAllCode = function () {
                $('.' + SourceCode).removeClass(SourceCodeShow);
                $('.' + SourceCodeToggleAll).removeClass(SourceCodeToggleAllHide);

                //Scroll to section
                var navHash = utils.parseNavHash();
                utils.scrollToSection(navHash);
            };

            if ($('[class*="src-"]:not(.source_visible)')[0]) {
                innerNavigation.addMenuItem(RES_TOGGLER_SHOW_CODE, showAllCode, hideAllCode, 'source_source-code_action-item');
            }

            showStaticCode();
        });
    }
});
