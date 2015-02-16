/*
 *
 * View demo-examples source code
 *
 * */

define([
    "jquery",
    "sourceModules/module",
    "sourceModules/trimSpaces",
    "sourceModules/utils",
    "sourceModules/browser",
    "sourceModules/exampleTabs",
    "sourceModules/sections",
    "sourceLib/codeFormat",
    "sourceModules/innerNavigation",
    "sourceVendor/highlight/highlight.pack"
], function($, module, trimSpaces, utils, browser, exampleTabs, sections, codeFormat, innerNavigation, hljs) {
    'use strict';

    function CodeSource() {
        var _this = this;

        this.options.modulesOptions.CodeSource = $.extend(true, {
            classes: {
                sourceCode: 'source_source-code'
            },
            res: {
                togglerShowCode: 'Show source'
            }
        }, this.options.modulesOptions.CodeSource);

        // Shorthands
        this.moduleOpts = this.options.modulesOptions.CodeSource;
        this.res = this.moduleOpts.res;
        this.classes = this.moduleOpts.classes;

        $(function(){
            _this.init();
        });

        return this;
    }

    CodeSource.prototype = module.createInstance();
    CodeSource.prototype.constructor = CodeSource;

    CodeSource.prototype.init = function () {
        this.generateCodeExamples();
        this.wrapTags();
        this.fillCodeContainers();
        this.prepareTabs();
        this.highLight();

        innerNavigation.addMenuItem(this.res.togglerShowCode, this.showAllCode, this.hideAllCode);
    };

    CodeSource.prototype.generateCodeExamples = function () {
        //var _this = this;

        var goThroughExamples = function(examples){
            Object.keys(examples).forEach(function (exampleID) {
                var example = section.examples[exampleID];
                var $examplePrev = example.$el.prev();

                if (!($examplePrev.hasClass('src-html') && ($.trim($examplePrev.html()) === ''))) {
                    example.$el.before('<div class="source_source-code source_clean source_hidden"><pre class="src-html"><code></code></pre></div>');
                }
            });
        };

        for (var i = 0; i < sections.getQuantity(); i++) {
            var section = sections.getSections()[i];

            goThroughExamples(section.examples);
        }
    };

    // Wrap and prepare all code examples
    CodeSource.prototype.wrapTags = function() {
        var $selection = $('.source_section pre > code, .source_section code[class*="src-"], .source_section > code');

        $selection.each(function() {
            var $this = $(this);
            var classes = $this.attr('class');
            $this.attr('class','');

            if (!$(this).parent().is('pre')) {
                $this.wrap('<pre></pre>');
                $(this).parent().attr('class', classes);
            }

            if ($(this).parent().parent('.source_source-code').length === 0) {
                $(this).parent().wrap('<div class="source_source-code source_clean"></div>');
            }

            if ($(this).parent().hasClass('source_visible')) {
                $(this).parent().removeClass('source_visible');
                $(this).parent().parent().addClass('source_visible');
            }

            if ($(this).parent().hasClass('src-html')) {
                $this.formatify();
            }
        });
    };

    CodeSource.prototype.prepareTabs = function() {
        //var _this = this;

        var goThroughExamples = function(examples){
            Object.keys(examples).forEach(function (exampleID) {
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
        };

        for (var i = 0; i < sections.getQuantity(); i++) {
            var section = sections.getSections()[i];

            goThroughExamples(section.examples);
        }
    };

    CodeSource.prototype.fillCodeContainers = function() {
        var _this = this;

        // Auto copy HTML in code.html if it's now filled
        var selection = $('.source_source-code > pre.src-html > code');
        selection.each(function () {
            var $this = $(this);

            if ($this.html().trim().length === 0) {
                var HTMLcode = $this.parents('.source_source-code').nextAll('.'+ _this.options.EXAMPLE_CLASS +':first').html().trim();

                //$this.html(trimSpaces.trimHTML(HTMLcode));
                $this.html(HTMLcode);
                $this.formatify();
            }
        });
    };

    CodeSource.prototype.highLight = function() {
        var selection = $('.source_source-code > pre > code');

        selection.each(function () {
            var $this = $(this);

            var HTMLcode = $this.html();

            // Removing unwanted spaces and tabs
            var spaces = HTMLcode.replace(/\t/,'  ').match(/^\s{0,}/)[0].length;
            var HTMLarray = HTMLcode.trim().split("\n");
            for (var i=0; i<HTMLarray.length;i++) {
                HTMLarray[i] = HTMLarray[i].replace(new RegExp(' {'+(spaces-1)+'}'), '');
            }
            HTMLcode = HTMLarray.join('\n');
            $this.html(HTMLcode);

            hljs.highlightBlock($this[0]);
        });
    };

    //Show / hide source
    CodeSource.prototype.showAllCode = function () {
        // TODO: send to tabs to show all
    };

    CodeSource.prototype.hideAllCode = function () {
        // TODO: send to tabs to hide all
    };

    return new CodeSource();
});