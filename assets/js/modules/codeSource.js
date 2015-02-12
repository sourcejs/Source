/*
 *
 * View demo-examples source code
 *
 * */

define([
    "jquery",
    "source/load-options",
    "sourceModules/utils",
    "sourceModules/browser",
    "sourceModules/exampleTabs",
    "sourceModules/sections",
    "sourceLib/codeFormat",
    "sourceModules/innerNavigation",
    "sourceVendor/prism/prism"
], function($, options, utils, browser, exampleTabs, sections, codeFormat, innerNavigation) {
    'use strict';

    // TODO: refactor to new module

    $(document).ready(function() {
        var SOURECE_CODE = 'source_source-code';
        var TOGGLER_SHOW_CODE = 'Show source';

        // Add HTML source code container before each example without it
        var generateCodeExamples = function() {
            for (var i = 0; i < sections.getQuantity(); i++) {
                var section = sections.getSections()[i];

                Object.keys(section.examples).forEach(function (exampleID) {
                    var example = section.examples[exampleID];
                    var $examplePrev = example.$el.prev();

                    if (!($examplePrev.hasClass('src-html') && ($.trim($examplePrev.html()) === ''))) {
                        example.$el.before('<div class="source_source-code source_clean source_hidden"><pre class="src-html"><code></code></pre></div>');
                    }
                });
            }
        };

        // Wrap and prepare all code examples
        var wrapTags = function() {
            var $selection = $('.source_section pre > code, .source_section > code[class*="src-"]');

            $selection.each(function() {
                var $this = $(this);
                var classes = $this.attr('class');
                $this.attr('class','');

                if (!$(this).parent().is('pre')) {
                    $this.wrap('<pre></pre>');
                    $(this).parent().attr('class', classes);
                }

                if ($(this).parent().parent('.source_source-code').length === 0) {
                    $(this).parent().wrap('<div class="source_source-code source_clean"></div>')
                }

                if ($(this).parent().hasClass('source_visible')) {
                    $(this).parent().removeClass('source_visible');
                    $(this).parent().parent().addClass('source_visible');
                }

                if ($(this).parent().hasClass('src-html')) {
                    $this.formatify()
                }
            });
        };

        var prepareTabs = function() {
            var _this = this;

            for (var i = 0; i < sections.getQuantity(); i++) {
                var section = sections.getSections()[i];

                Object.keys(section.examples).forEach(function (exampleID) {
                    var example = section.examples[exampleID];
                    var codeNum = 1;

                    var $codeContainers = example.$el.prevUntil('*:not(.source_source-code)');

                    $codeContainers.each(function(){
                        var $this = $(this);
                        var codeID = example.id + '-code-' + codeNum;
                        codeNum++;

                        $this.attr('id', codeID);

                        var visible = $this.hasClass('source_visible');

                        // Adding tab for each example
                        exampleTabs.addTab(example.tabs.$el, {
                            checked: visible,
                            exampleID: exampleID,
                            contentID: codeID
                        });

                        if (visible) {
                            // We leave it only for flagging block
                            $this.removeClass('source_visible');
                        } else {
                            $this.addClass('source_hidden');
                        }
                    });
                });
            }
        };

        var fillCodeContainers = function() {
            // Auto copy HTML in code.html if it's now filled
            var selection = $('.source_source-code > pre.src-html > code');
            selection.each(function () {
                var $this = $(this);

                if ($this.html().trim().length === 0) {
                    var HTMLcode = $this.parents('.source_source-code').nextAll('.'+ options.EXAMPLE_CLASS +':first').html();

                    $this.html(HTMLcode);
                    $this.formatify();
                }
            });
        };

        var highLight = function() {
            var selection = $('.source_source-code > pre > code');

            selection.each(function () {
                var $this = $(this);

                // Removing unwanted spaces and tabs
                var HTMLcode = $this.html();
                var spaces = HTMLcode.replace(/\t/,'  ').match(/^\s{0,}/)[0].length;
                var HTMLarray = HTMLcode.trim().split("\n");
                for (var i=0; i<HTMLarray.length;i++) {
                    HTMLarray[i] = HTMLarray[i].replace(new RegExp(' {'+(spaces-1)+'}'), '');
                }
                HTMLcode = HTMLarray.join('\n');
                $this.html(HTMLcode);

                Prism.highlightElement($this[0]);
            });
        };

        //Show / hide source
        var showAllCode = function () {
            // TODO: send to tabs to show all
        };

        var hideAllCode = function () {
            // TODO: send to tabs to hide all
        };

        generateCodeExamples();
        wrapTags();
        fillCodeContainers();
        prepareTabs();
        highLight();

        innerNavigation.addMenuItem(TOGGLER_SHOW_CODE, showAllCode, hideAllCode);
    });
});