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


        var wrapTags = function() {
            var _this = this;

            for (var i = 0; i < sections.getQuantity(); i++) {
                var section = sections.getSections()[i];

                Object.keys(section.examples).forEach(function (exampleID) {
                    var example = section.examples[exampleID];
                    var $examplePrev = example.$el.prev();
                    var codeNum = 1;

                    // Add HTML source code container before each example without it
                    if (!($examplePrev.hasClass('src-html') && ($.trim($examplePrev.html()) === ''))) {
                        example.$el.before('<pre class="src-html source_hidden"><code></code></pre>');
                    }

                    var $codeContainers = example.$el.prevUntil('*:not([class*="src-"])');

                    $codeContainers.each(function(){
                        var $this = $(this);
                        var codeID = example.id + '-code-' + codeNum;
                        codeNum++;

                        // Wrap code to <pre>
                        if ($this.is('code')) {
                            var codeClass = $this.attr('class');
                            $this.attr('class','');

                            // Pointing $this to new parent <pre>
                            $this = $this.wrap('<pre class="'+ codeClass +'" id="'+ codeID +'"></pre>').parent();
                        } else {
                            $this.attr('id', codeID);
                        }

                        //if ($this.hasClass('src-html')) {
                        //    var HTMLcode = $this.html();
                        //    $this.html(HTMLcode.replace(/</g, "&lt;").replace(/>/g,"&gt;"));
                        //}

                        var visible = $this.hasClass('source_visible');

                        // Adding tab for each example
                        exampleTabs.addTab(example.tabs.$el, {
                            checked: visible,
                            exampleID: exampleID,
                            contentID: codeID
                        });

                        $this.addClass('source_example-code');

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
            var selection = $('.source_section pre.src-html > code');
            selection.each(function () {
                var $this = $(this);

                if ($this.html().trim().length === 0) {
                    var HTMLcode = $this.parent().nextAll('.'+ options.EXAMPLE_CLASS ).html();

                    $this.html(HTMLcode);
                    $this.formatify();
                }
            });
        };

        var activateHighligt = function() {
            var selection = $('.source_section pre[class*="src-"] > code');

            selection.each(function() {
                var _this = $(this);

                Prism.highlightElement(_this[0]);
            });
        };

        //Show / hide source
        var showAllCode = function () {
            // TODO: send to tabs to show all
        };

        var hideAllCode = function () {
            // TODO: send to tabs to hide all
        };

        wrapTags();
        fillCodeContainers();
        activateHighligt();

        innerNavigation.addMenuItem(TOGGLER_SHOW_CODE, showAllCode, hideAllCode);
    });
});