/*
 *
 * HTML Code Formatter
 *
 * @author Dennis Przendzinski
 *
 * */

sourcejs.amd.define([
    "jquery"
], function($) {

    return function($el, options) {

        var selfClosing = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]; // list of self-closing tags

        return $el.each(function() {

            var settings = $.extend({
                    escape:true // escape HTML symbols (<,>,&)
                    ,log:false // console log source code
                }, options)
                , tabs = 0
                , code = $(this).html()
                ;

            var indentCode = function (line) {
                var _tabs = tabs < 0 ? 0 : tabs;

                return new Array(_tabs + 1).join(' ') + line;
            };

            if (code.length > 0) {
                code = code.trim()
                    .replace(/[\n\t\r]/g, '') // strip all tabs, carriage returns and new lines
                    .replace(/\s{2,}/g, ' ') // strip extra (2+) white spaces
                    .replace(/< /g, "<") // remove spaces after "<"
                    .replace(new RegExp('<(\\b(' + selfClosing.join("|") + ')\\b[^>]*?)>', "g"), '<$1/>') // create regex from inline array or self-closing tags and close them if required
                    .replace(/<(?!\/)/g, "\n<") // start each tag from new line
                    .match(/<(?!\/)[^>].+?\/>|<!--.*?-->|<(?!\/)[^>]+?>.*?<\/[^>]+?>.*?(?=<)|<(?!\/)[^>]+?>*?<\/[^>]+?>|<(?!\/)[^>]+?>.+?<\/[^>]+?>|<(?!\/)[^>]+>.*|<(?=\/)[^>].+?>|[^<\r\n]+/g) // combine into array
                ;

                for (var i=0; i< code.length; i++) {
                    if (code[i].match(/<(?!\/)/) && !(code[i].match(/<(?=\/)/)) && !(code[i].match(/<!-.*?-->/))) { // if the string contains opening tag and doesn't contain closing tag...
                        var tag = code[i].match(/<([^ \/>]+)/)[1]; // ...strip the tag (<img class="foo"> -> img) to check against the array of self-closing tags and increase indentation
                        code[i] = indentCode(code[i]);
                        if (selfClosing.indexOf(tag) === -1) {
                            tabs +=2;
                        }
                    }
                    else if (!(code[i].match(/<(?!\/)/)) && code[i].match(/<(?=\/)/)) { // if the string contains closing tag and doesn't contain opening tag, decrease indentation
                        tabs -=2;
                        code[i] = indentCode(code[i]);
                    }
                    else { // otherwise just keep current indentation
                        code[i] = indentCode(code[i]);
                    }

                    if (settings.escape) { code[i] = code[i].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g,"&gt;"); }
                    if (settings.log) { console.log(code[i]); }
                }
                $(this).html(code.join('\n'));
            }
        });
    }

});
