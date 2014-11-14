/*
 *
 * Spec HTML parser for API
 *
 * @author Dmitry Lapynow
 *
 * */

// TODO: wrap as requirejs module, and combine with phantom-runner.js

function SourceGetSections() {
    // Defining strict inside func, because PhantomJS stops evaluating this script if it's on top
    'use strict';

    var config = {
        // include params from opt@argument first
        code: 'source_example',
        h2: 'source_section_h',
        h3: 'H3',
        h4: 'H4',
        timeout: 3000
    };

    var _h2 = 0, _h3 = 0, _h4 = 0;
    var elem;
    var prevFlag;
    var root = false;

    function getSections() {
        var specData = [];
        var sections = [].slice.call(document.getElementsByClassName(config.h2));

        if (sections[0]) {
            for (var i = 0, l = sections.length; i < l; i++) {
                elem = sections[i];
                specData.push(parse(elem));
            }

            return specData;
        } else {
            return JSON.stringify([{
                "error": "Spec page parsing error."
            }]);
        }
    }

    function parse(section) {
        _h2++;
        _h3 = 0;
        _h4 = 0;

        return new Spec(section);
    }

    function Spec(section) {
        if (section.next){
            elem = (elem)? elem.nextElementSibling : null;
        }

        // this.html = getHTML(elem); // @Array with code
        // this.ID = returnId();
        this.header = section.header || getHeader(elem);
        this.nested = [];
        this.html = [];

        while (elem) {
            if (root) {
                elem = elem.previousElementSibling;
                root = false;
                break;
            }

            var
                tag = elem.tagName,
                cls = elem.className,
                flag = checkElem(tag, cls)
                ;

            if (flag === 'H2') {
                this.header = getHeader(elem);
                prevFlag = flag;
            }
            else if (flag === 'CODE') {
                this.html.push(getHTML(elem));
            }
            else if (flag === 'H3') {
                if (prevFlag === 'H4') {
                    root = true;
                }

                if (prevFlag === 'H3' || prevFlag === 'H4') {
                    prevFlag = null;
                    elem = elem.previousElementSibling;
                    break;
                }
                _h3++;
                _h4 = 0;
                prevFlag = flag;
                this.nested.push(new Spec({header: getHeader(elem), next: true}));
            }
            else if (flag === 'H4') {
                if (prevFlag === flag) {
                    prevFlag = null;
                    elem = elem.previousElementSibling;
                    break;
                }
                _h4++;
                prevFlag = flag;
                this.nested.push(new Spec({header: getHeader(elem), next: true}));
            }

            if (elem) elem = elem.nextElementSibling;
        }
    }

// HELPERS
//    function returnId() {
//        return [_h2, _h3, _h4].join('.');
//    }

    function getHeader(elem) {
        return elem.innerText || 'API: cannot get header.';
    }

    function getHTML(elem) {
        return elem.innerHTML;
    }

    function checkElem(tag, cls) {
        return isH2(tag, cls) || isH3(tag, cls) || isH4(tag, cls) || isCode(tag, cls);
    }

    function isH2(tag, cls) {
        return (tag === 'H2' && cls.match(new RegExp('\\b'+ config.h2 + '\\b')))? 'H2' : false;
    }

    function isH3(tag) {
        return (tag === 'H3')? 'H3' : false;
    }

    function isH4(tag) {
        return (tag === 'H4')? 'H4': false;
    }

    function isCode(tag, cls) {
        return ((tag === 'SECTION' || tag === 'DIV') && cls.match(new RegExp('\\b'+ config.code + '\\b')))? 'CODE' : false;
    }

    /* Start parser */
    this.specHTMLContents = getSections();
    this.specResourceLinks = this.parseResourceLinks();
}

SourceGetSections.prototype.parseResourceLinks = function(){
    'use strict';

    var output = {};

    output.cssLinks = this.getCssLinksHTML();
    output.scriptLinks = this.getScriptsHTML();
    output.cssStyles = this.getStyleContainersHTML();

    return output;
};

SourceGetSections.prototype.getCssLinksHTML = function() {
    var links = document.head.getElementsByTagName('link');
    var linksArr = [];

    // Checking some exceptions
    var checkDataSet = function(el){
        return !!(
            el.dataset['nonclarify'] ||
            el.dataset['source'] === 'core' ||
            el.dataset['source'] === 'plugin'
        );
    };

    var i = 0;
    var el;
    while(i < links.length) {
        el = links[i];

        if (el.rel === 'stylesheet' || el.type === 'text/css') {

            // Check script attrs before adding to output
            if (el.dataset && checkDataSet(el)) {
                ++i;
                continue;
            }

            // If not need to filter out, then push to output
            linksArr.push(el.outerHTML);
            ++i;
        }
    }

    return linksArr;
};

SourceGetSections.prototype.getScriptsHTML = function() {
    var scripts = document.head.getElementsByTagName('script');
    var scriptsArr = [];

    // Checking some exceptions
    var checkDataSet = function(el){
        return !!(
            el.dataset['nonclarify'] ||
            el.dataset['requiremodule'] ||
            el.dataset['source'] === 'core' ||
            el.dataset['source'] === 'plugin'
        );
    };

    var i = 0;
    var el;
    while(i < scripts.length) {
        el = scripts[i];

        // Check script attrs before adding to output
        if (el.dataset && checkDataSet(el)) {
            ++i;
            continue;
        }

        // If not need to filter out, then push to output
        scriptsArr.push(el.outerHTML);
        ++i;
    }

    return scriptsArr;
};

SourceGetSections.prototype.getStyleContainersHTML = function() {
    var styleTag = document.head.getElementsByTagName('style')[0];
    return (styleTag) ? styleTag.outerHTML : "";
};

SourceGetSections.prototype.getContents = function(){
    'use strict';

    return this.specHTMLContents;
};

SourceGetSections.prototype.getResourceLinks = function(){
    'use strict';

    return this.specResourceLinks;
};