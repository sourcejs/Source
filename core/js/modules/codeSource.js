/*
*
* View demo-examples source code
*
* @author Robert Haritonov (http://rhr.me)
*
* */

define([
    "jquery",
    "core/options",
    "modules/utils",
    "modules/css",
    "modules/browser",
    "core/lib/SyntaxHighlighter/XRegExp",
    "modules/innerNavigation"
    ], function($, options, utils, css, browser, sh, innerNavigation) {

    if (!($.browser.msie && parseInt($.browser.version) < 9)) { // and if not ie < 9

        $(function(){

            var
                ResHideCode = 'Спрятать',
                ResShowCode = 'Показать',
                ResCode = 'код',

                SourceCode = 'source_source-code',
                SourceCodeShow = SourceCode + '__show',
                SourceCodeMin = SourceCode + '__min',

                SourceCodeCnt = 'source_source-code_cnt',

                SourceCodeToggle = 'source_source-code_toggle',
                SourceCodeToggleCSS = SourceCodeToggle + '__css',
                SourceCodeToggleHTML = SourceCodeToggle + '__html',
                SourceCodeToggleJS = SourceCodeToggle + '__js',

                SourceCodeToggleAll = 'source_source-code_toggle-all',
                SourceCodeToggleAllHide = SourceCodeToggleAll + '__hide',

                urlConfig = 'sc',

                prepared = false,
                highlighted = false;

            //Add HTML code container before each example without it by default
            var createAndFillBrushHTML = function() {

                $('.source_example').each(function () {
                    var t = $(this);

                    //script type="text/html" used to isolate repeated HTML
                    if (!t.prev().hasClass('html')) {
                        t.before('<code class="brush : html"><script class="source_example_seal" type="text/html"></script></code>')
                    }
                });

                //Auto copy HTML in code.html if it's now filled
                $('.source_section > code.html > script').each(function () {
                    if ($(this).html().trim().length === 0) {
                        var HTMLcode = $(this).parent().nextAll('.'+ options.exampleSectionClass ).html();

                        $(this).html(HTMLcode);
                    }
                });
            };

            //Code show toggle on each code blcock
            var prepareCodeBlocks = function() {
                new css('SyntaxHighlighter/shCoreDefault.css','/core/js/lib/');
                new css('SyntaxHighlighter/shCoreCustom.css','/core/js/lib/');

                $('.source_section > code.brush:not(.source_visible)').each(function () {
                    var t = $(this),
                            langClass;

                    if (t.hasClass('css')) {
                        langClass = SourceCodeToggleCSS;
                    } else if (t.hasClass('html')) {
                        langClass = SourceCodeToggleHTML;
                    } else if (t.hasClass('js')) {
                        langClass = SourceCodeToggleJS;
                    }

                    t.wrap('<div class="source_source-code"><div class="' + SourceCodeCnt + '"></div></div>');

                    t.closest('.' + SourceCode).prepend('' +
                            '<a href="" onclick="return false" class="' + SourceCodeToggle + ' ' + langClass + '"><span class="source_hide">' + ResHideCode + '</span><span class="source_show">' + ResShowCode + '</span> ' + ResCode + '</a>' +
                            '');

                });
            };

            var activateHighlighter = function(handler) {
                //shCore need xRegExp to work
                require(["jquery","core/lib/SyntaxHighlighter/shCore"], function($) {

                    //Unseal from script type=text/html
                     $('code.brush > script.source_example_seal').each(function () {
                         var source = $(this).html();
                         $(this).parent().html(source);
                     });

                    SyntaxHighlighter.config.tagName = "code";
                    SyntaxHighlighter.defaults['toolbar'] = false;
                    SyntaxHighlighter.defaults['quick-code'] = false;
                    SyntaxHighlighter.defaults['tab-size'] = 2;

                    var highlighterLibs = [
                        "core/lib/SyntaxHighlighter/shBrushCss",
                        "core/lib/SyntaxHighlighter/shBrushXml",
                        "core/lib/SyntaxHighlighter/shBrushSass",
                        "core/lib/SyntaxHighlighter/shBrushJScript"
                    ];

                    require(highlighterLibs, function() {
                        SyntaxHighlighter.highlight();
                        highlighted = true;

                        handler();
                    })

                })
            };

            var afterActivation = function(hash) {
                $('.' + SourceCode).addClass(SourceCodeShow);

                //Scroll to section
                var navHash = utils.parseNavHash(hash);
                utils.scrollToSection(navHash);
            };

            //Toggle show source sections
            var initCodePartToggler = function() {
                $('.' + SourceCodeToggle).on({
                    'click' : function () {
                        var t = $(this),
                                codeCnt = t.closest('.' + SourceCode);

                        if (codeCnt.hasClass(SourceCodeMin)) { //If section minimized
                            codeCnt.removeClass(SourceCodeMin);
                        } else {
                            codeCnt.addClass(SourceCodeMin);
                        }
                    }
                });
            };

            //Get source code before triming
            if (options.modulesEnabled.trimSpaces) {
                createAndFillBrushHTML();
            }

            //temp for spec documentation, TODO: make possible to leave visible code blocks
            $('.source_section > code.brush.source_visible').each(function () {
                //If triming is off, then prepare code fill brushes only on activation
                if (!options.modulesEnabled.trimSpaces) {
                    createAndFillBrushHTML();
                }

                prepareCodeBlocks();
                initCodePartToggler();

                prepared = true;

                activateHighlighter();
            });

            //Show/hide source
            var showAllCode = function () {
                var hash = window.location.hash;

                if (!prepared) {

                    //If triming is off, then prepare code fill brushes only on activation
                    if (!options.modulesEnabled.trimSpaces) {
                        createAndFillBrushHTML();
                    }

                    prepareCodeBlocks();
                    initCodePartToggler();

                    prepared = true;
                }

                if (!highlighted) {
                    activateHighlighter(function() {
                        afterActivation(hash);
                    });
                } else {
                    afterActivation(hash);
                }

            //TODO: finish url update on code show toggle functionality
//                var updateHref = hash === '' ? '!sc' : hash + urlConfig;
//                window.location.hash = updateHref;
            };

            var hideAllCode = function () {
                var hash = window.location.hash;

                $('.' + SourceCode).removeClass(SourceCodeShow);
                $('.' + SourceCodeToggleAll).removeClass(SourceCodeToggleAllHide);

                //Scroll to section
                var navHash = utils.parseNavHash(hash)
                utils.scrollToSection(navHash);
            };

            //If url has '!sc', show source code by default
            var getUrlParam = document.location.href.split(options.modulesOptions.innerNavgation.hashSymb);

            getUrlParam = getUrlParam[getUrlParam.length - 1];

            if (getUrlParam === urlConfig) {
                showAllCode();
            }

            //Toggle show all code action
            innerNavigation.addMenuItem('Исходный код', showAllCode, hideAllCode);

        });
    }
});