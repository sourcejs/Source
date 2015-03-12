'use strict';

var path = require('path');
var cheerio = require('cheerio');
var prettyHrtime = require('pretty-hrtime');
var translit = require(path.join(global.pathToApp,'core/lib/translit'));

var marked = require('marked');
var renderer = new marked.Renderer();
marked.setOptions({
  renderer: renderer
});

/*
 * Get file content from response and parse contained Markdown markup
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function (req, res, next) {
    if (req.specData && req.specData.renderedHtml && req.specData.isMd) {
        var start = process.hrtime();
        var input = req.specData.renderedHtml;

        // Processing with native markdown renderer
        renderer.code = function (code, language) {
            if (language === 'example') {
                return '<div class="source_example">'+ code +'</div>';
            } else if (language && language !== '') {
                return '<code class="src-'+ language +' source_visible">'+ code +'</code>';
            } else {
                return '<pre><code class="lang-source_wide-code">'+ code +'</code></pre>';
            }
        };

        renderer.heading = function (text, level) {
            var escapedText = translit(text);

            return '<h' + level + ' id="' + escapedText + '">' + text + '</h' + level + '>';
        };

        var $ = cheerio.load('<div id="content">'+ marked(input) +'</div>');

        // Spec description
        var $H1 = $('#content > h1');
        var $afterH1 = $H1.nextUntil('h2');
        $afterH1.remove();
        $H1.after('<div class="source_info">'+ $afterH1 +'</div>');

        // Spec sections
        $('#content > h2').each(function(){
            var $this = $(this);
            var $filteredElems = $('');

            var $sectionElems = $this.nextUntil('h2');
            var id = $this.attr('id');
            $this.removeAttr('id');

            // Adding additional check, since cheerio .nextUntil is not stable
            $sectionElems.each(function(){
                if (this.tagName === 'h2') return false;

                $filteredElems = $filteredElems.add(this);
            });

            $filteredElems.remove();

            $(this).replaceWith([
                '<div class="source_section" id="'+ id +'">',
                    $this +  $filteredElems,
                '</div>'
            ].join(''));
        });

        req.specData.renderedHtml = $('#content').html();

        var end = process.hrtime(start);
        global.log.debug('Markdown processing took: ', prettyHrtime(end));

        next();
    } else {
        next();
    }
};