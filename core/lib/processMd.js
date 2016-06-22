'use strict';

var path = require('path');
var marked = require('marked');
var markdownit = require('markdown-it');
var cheerio = require('cheerio');
var _ = require('lodash');
var translit = require(path.join(global.pathToApp,'core/lib/translit'));
var utils = require(path.join(global.pathToApp,'core/lib/utils'));

var markedRenderer = new marked.Renderer();
var markedCodeRenderCounter = 0;

// Module configuration
var globalConfig = global.opts.core && global.opts.core.processMd ? global.opts.core.processMd : {};
var config = {
	espaceCodeHTML: true,
	languageRenderers: {
		example: function (code) {
			return '<div class="source_example">' + code + '</div>';
		}
	},
	languagePlugins: {
		pseudo: function (code) {
			return ['hover', 'active'].reduce(function (result, item) {
				return result + '<div class="' + item + '">' + code + '</div>';
			}, '');
		}
	},

	// Define marked module options
	marked: {}
};

var mdCodeRenderer = function (code, language) {
    var result = '';
    var temp = (language || '').split(':');
    language = temp[0];
    var plugins = (temp[1] || '').split(',');

    code = plugins.reduce(function (result, item) {
        if (config.languagePlugins.hasOwnProperty(item)) {
            return config.languagePlugins[item](result, markedCodeRenderCounter);
        }
        return result;
    }, code);

    if (config.languageRenderers.hasOwnProperty(language)) {
        result = config.languageRenderers[language](code, markedCodeRenderCounter);
    } else {
        if (config.espaceCodeHTML) code = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        if (language && language !== '') {
            result = '<code class="src-' + language + ' source_visible">' + code + '</code>';
        } else {
            result = '<pre><code class="lang-source_wide-code">' + code + '</code></pre>';
        }
    }

    markedCodeRenderCounter++;
    return result;
};
var mdHeadingRenderer = function (text, level) {
    var escapedText = translit(text);

    return '<h' + level + ' id="' + escapedText + '">' + text + '</h' + level + '>';
};


// Overwriting base options
utils.extendOptions(config, globalConfig);

// Processing with native markdown renderer
markedRenderer.code = mdCodeRenderer;
markedRenderer.heading = mdHeadingRenderer;

// Extend re-defined renderer
config.marked.renderer = _.merge(markedRenderer, config.marked.renderer);

marked.setOptions(config.marked);


var markdownitRenderer = markdownit({
  html: true,
  xhtmlOut: true,
  highlight: mdCodeRenderer
});

console.log(markdownitRenderer);

module.exports = function (markdown, options) {
    markedCodeRenderCounter = 0;

    var _options = options || {};
    var $ = cheerio.load('<div id="content">' + markdownitRenderer.render(markdown) + '</div>');
    var $content = $('#content').first();

    if (_options.wrapDescription) {
        // Spec description
        var $startElement;
        var $H1 = $content.children('h1').first();

        if ($H1.length > 0) {
            $startElement = $H1;
        } else {
            $content.prepend('<div id="sourcejs-start-element"></div>');
            $startElement = $content.children('#sourcejs-start-element').first();
        }

        var $description = $startElement.nextUntil('h2');
        $description.remove();
        $startElement.after('<div class="source_info">' + $description + '</div>');
        $content.children('#sourcejs-start-element').first().remove();
    }

    // Spec sections
    $content.children('h2').each(function () {
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

    return $content.html();
};
