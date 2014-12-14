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
        sectionHeader: '.source_section > h2:first-child',
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
        var sections = [].slice.call(document.querySelectorAll(config.sectionHeader));

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
            elem = (elem) ? getNextSibling(elem) : null;
        }

        // this.html = getHTML(elem); // @Array with code
        // this.ID = returnId();
        this.id = returnId();
        this.header = section.header || getHeader(elem);
        this.nested = [];
        this.html = [];

        while (elem) {
            if (root) {
                elem = getPreviousSibling(elem);
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
                    elem = getPreviousSibling(elem);

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
                    elem = getPreviousSibling(elem);
                    break;
                }
                _h4++;
                prevFlag = flag;
                this.nested.push(new Spec({header: getHeader(elem), next: true}));
            }

            if (elem) {
                elem = getNextSibling(elem);
            }
        }
    }

    // HELPERS
    function getNextSibling(elem) {
        // JSdom doesn't support nextElementSibling
        var nextSibling = elem.nextSibling;

        // Checking if next sibling is an element, not whitespace
        while(nextSibling && nextSibling.nodeType !== 1) {
            nextSibling = nextSibling.nextSibling;
        }

        return nextSibling;
    }

    function getPreviousSibling(elem) {
        // JSdom doesn't support previousElementSibling
        var previousSibling = elem.previousSibling;

        // Checking if prev sibling is an element, not whitespace
        while(previousSibling && previousSibling.nodeType !== 1) {
            previousSibling = previousSibling.previousSibling;
        }

        return previousSibling;
    }

    function returnId() {
        var idArr = [_h2];

        if (_h3 > 0) idArr.push(_h3);
        if (_h4 > 0) idArr.push(_h4);

        return idArr.join('.');
    }

    function getHeader(elem) {
        return elem.textContent || 'API: cannot get header.';
    }

    function getHTML(elem) {
        return elem.innerHTML;
    }

    function checkElem(tag, cls) {
        return isH2(tag, cls) || isH3(tag, cls) || isH4(tag, cls) || isCode(tag, cls);
    }

    function isH2(tag) {
        return (tag === 'H2') ? 'H2' : false;
    }

    function isH3(tag) {
        return (tag === 'H3')? 'H3' : false;
    }

    function isH4(tag) {
        return (tag === 'H4')? 'H4': false;
    }

    function isCode(tag, cls) {
        return ( (tag === 'SECTION' || tag === 'DIV') && cls.match(new RegExp('\\b'+ config.code + '\\b')) ) ? 'CODE' : false;
    }

    /* Start parser */
    this.specHTMLContents = getSections();
    this.headResources = this.parseHeadResourceLinks();
}

SourceGetSections.prototype.parseHeadResourceLinks = function(){
    'use strict';

    var output = {};

    output.cssLinks = this.getCssLinksHTML();
    output.scriptLinks = this.getScriptsHTML();
    output.cssStyles = this.getStyleContainersHTML();

    return output;
};

SourceGetSections.prototype.getCssLinksHTML = function() {
    'use strict';

    var links = document.head.getElementsByTagName('link');
    var linksArr = [];

    // Checking some exceptions
    var checkDataSet = function(el){
        return !!(
            el.getAttribute('data-nonclarify') ||
            el.getAttribute('data-source') === 'core' ||
            el.getAttribute('data-source') === 'plugin'
        );
    };

    var i = 0;
    var el;
    while(i < links.length) {
        el = links[i];

        if (el.rel === 'stylesheet' || el.type === 'text/css') {
            // Check script attrs before adding to output
            if (checkDataSet(el)) {
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
    'use strict';

    var scripts = document.head.getElementsByTagName('script');
    var scriptsArr = [];

    // Checking some exceptions
    var checkDataSet = function(el){
        return !!(
            el.getAttribute('data-nonclarify') ||
            el.getAttribute('data-requiremodule') ||
            el.getAttribute('data-source') === 'core' ||
            el.getAttribute('data-source') === 'plugin'
        );
    };

    var i = 0;
    var el;
    while(i < scripts.length) {
        el = scripts[i];

        // Check script attrs before adding to output
        if (checkDataSet(el)) {
            ++i;
            continue;
        }

        // If not need to filter out, then push to output
        scriptsArr.push(el.outerHTML);
        ++i;
    }

    return scriptsArr;
};

SourceGetSections.prototype.getStyleContainersHTML = function(){
    'use strict';

    var styleTag = document.head.getElementsByTagName('style')[0];
    return (styleTag) ? styleTag.outerHTML : "";
};

SourceGetSections.prototype.flattenHTMLContents = function(){
    'use strict';
    var flatList = {};

    var parseContents = function(contents){
        for (var i=0; contents.length > i ; i++) {
            var current = contents[i];

            flatList[current.id] = current;

            if (current.nested.length > 0) {
                parseContents(current.nested);
            }
        }
    };

    parseContents(this.specHTMLContents);

    this.specHTMLContentsFlatObj = flatList;
};

SourceGetSections.prototype.getContentsByID = function(sections){
    'use strict';
    var _this = this;

    if (Array.isArray(sections) && sections.length > 0) {
        // Check if flattened object is already prepared
        if (!_this.specHTMLContentsFlatObj) {
            _this.flattenHTMLContents();
        }

        var pickedSections = [];

        sections.forEach(function(id){
            var objectToAdd = _this.specHTMLContentsFlatObj[id];

            if (objectToAdd) pickedSections.push(objectToAdd);
        });

        return pickedSections.length === 0 ? [] : pickedSections;
    } else {
        return [];
    }
};

SourceGetSections.prototype.getContents = function(sections){
    'use strict';

    if (sections) {
        return this.getContentsByID(sections);
    } else {
        return this.specHTMLContents;
    }
};

SourceGetSections.prototype.getHeadResources = function(){
    'use strict';

    return this.headResources;
};