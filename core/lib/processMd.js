'use strict';

var path = require('path');
var marked = require('marked');
var cheerio = require('cheerio');
var deepExtend = require('deep-extend');
var translit = require(path.join(global.pathToApp,'core/lib/translit'));

var renderer = new marked.Renderer();

// Module configuration
var globalConfig = global.opts.core && global.opts.core.processMd ? global.opts.core.processMd : {};
var config = {
    espaceCodeHTML: true
};
// Overwriting base options
deepExtend(config, globalConfig);

marked.setOptions({
    renderer: renderer
});

// Processing with native markdown renderer
renderer.code = function (code, language) {
    if (config.espaceCodeHTML) code = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (language === 'example') {
        return '<div class="source_example">' + code + '</div>';
    } else if (language && language !== '') {
        return '<code class="src-' + language + ' source_visible">' + code + '</code>';
    } else {
        return '<pre><code class="lang-source_wide-code">' + code + '</code></pre>';
    }
};

renderer.heading = function (text, level) {
    var escapedText = translit(text);

    return '<h' + level + ' id="' + escapedText + '">' + text + '</h' + level + '>';
};

module.exports = function (markdown) {
    var input = markdown;

    var $ = cheerio.load('<div id="content">' + marked(input) + '</div>');

    // Spec description
    var $H1 = $('#content > h1');
    var $afterH1 = $H1.nextUntil('h2');
    $afterH1.remove();
    $H1.after('<div class="source_info">' + $afterH1 + '</div>');

    // Spec sections
    $('#content > h2').each(function () {
        var $this = $(this);
        var $filteredElems = $('');

        var $sectionElems = $this.nextUntil('h2');
        var id = $this.attr('id');
        $this.removeAttr('id');

        // Adding additional check, since cheerio .nextUntil is not stable
        $sectionElems.each(function () {
            if (this.tagName === 'h2') return false;

            $filteredElems = $filteredElems.add(this);
        });

        $filteredElems.remove();

        $(this).replaceWith([
            '<div class="source_section" id="' + id + '">',
            $this + $filteredElems,
            '</div>'
        ].join(''));
    });

    return $('#content').html();
};