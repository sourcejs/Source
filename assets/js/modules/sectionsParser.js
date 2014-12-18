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
            return undefined;
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
}

/**
 * Filter list of HTML nodes
 *
 * @param {Array} elementsArr - nodelist to filter
 * @param {Function} [customElFilter] - Additional filter for element
 * @param {Boolean} [getAll] - Set to true, if expect not filtered list of resources
 *
 * @returns {Array} Returns array with HTML of Style containers OR undefined
 */
SourceGetSections.prototype.filterResourceElements = function(elementsArr, customElFilter, getAll){
    'use strict';

    var filteredArr = [];
    var defaultFilter = function(){ return true; };
    var _customElFilter = typeof customElFilter === 'function' ? customElFilter : defaultFilter;

    // Checking some exceptions
    var checkDataSet = function(el){
        if (getAll) {
            return true;
        } else {
            return !(
                el.getAttribute('data-nonclarify') ||
                el.getAttribute('data-requiremodule') ||
                el.getAttribute('data-source') === 'core' ||
                el.getAttribute('data-source') === 'plugin'
            );
        }
    };

    if (elementsArr && elementsArr.length > 0) {
        var i = 0;
        var el;
        while(i < elementsArr.length) {
            el = elementsArr[i];

            if (_customElFilter(el) && checkDataSet(el)) {
                // If not need to filter out, then push to output
                filteredArr.push(el.outerHTML);
            }
            ++i;
        }

        return filteredArr.length > 0 ? filteredArr : undefined;
    } else {
        return undefined;
    }
};

/**
 * Parse CSS links from Spec
 *
 * @param {Object} scope to search - document.head or document.body
 * @param {Boolean} [getAll] - Set to true, if expect not filtered list of resources
 *
 * @returns {Array} Returns array with HTML of CSS links OR undefined
 */
SourceGetSections.prototype.getCssLinksHTML = function(scope, getAll) {
    'use strict';

    var links = scope.getElementsByTagName('link');
    var customFilter = function(el){
        return el.rel === 'stylesheet' || el.type === 'text/css';
    };

    return this.filterResourceElements(links, customFilter, getAll);
};

/**
 * Parse Scripts from Spec
 *
 * @param {Object} scope to search - document.head or document.body
 * @param {Boolean} [getAll] - Set to true, if expect not filtered list of resources
 *
 * @returns {Array} Returns array with HTML of Scripts OR undefined
 */
SourceGetSections.prototype.getScriptsHTML = function(scope, getAll) {
    'use strict';

    var scripts = scope.getElementsByTagName('script');

    return this.filterResourceElements(scripts, null, getAll);
};

/**
 * Parse Style containers from Spec
 *
 * @param {Object} scope to search - document.head or document.body
 * @param {Boolean} [getAll] - Set to true, if expect not filtered list of resources
 *
 * @returns {Array} Returns array with HTML of Style containers OR undefined
 */
SourceGetSections.prototype.getStyleContainersHTML = function(scope, getAll){
    'use strict';

    var styles = scope.getElementsByTagName('style');

    return this.filterResourceElements(styles, null, getAll);
};

/**
 * Flatten HTML contents
 *
 * @returns {Object} Updates global 'specHTMLContentsFlatObj' and return flat specHTMLContents
 */
SourceGetSections.prototype.flattenHTMLContents = function(){
    // TODO: Move to CommonJS module, and reuse API/parseData.js
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
    return flatList;
};


/**
 * Get specific sections of Spec
 *
 * @param {Array} sections - Array of sections to return
 *
 * @returns {Object} Return array sections HTML OR undefined
 */
SourceGetSections.prototype.getContentsBySection = function(sections){
    // TODO: Move to CommonJS module, and reuse API/parseData.js
    'use strict';
    var _this = this;

    if (_this.specHTMLContents && Array.isArray(sections) && sections.length > 0) {
        // Check if flattened object is already prepared
        if (!_this.specHTMLContentsFlatObj) {
            _this.flattenHTMLContents();
        }

        var pickedSections = [];

        sections.forEach(function(id){
            var objectToAdd = _this.specHTMLContentsFlatObj[id];

            if (objectToAdd) pickedSections.push(objectToAdd);
        });

        return pickedSections.length === 0 ? undefined : pickedSections;
    } else {
        return undefined;
    }
};

/**
 * Getter for contents of the Spec
 *
 * @returns {Object} Returns object with spec HTML contents OR undefined
 */
SourceGetSections.prototype.getContents = function(){
    'use strict';

    return this.specHTMLContents;
};

/**
 * Get full spec object
 *
 * @param {Array} [sections] - Array of sections to return
 *
 * @returns {Object} Returns object with spec HTML contents OR undefined
 */
SourceGetSections.prototype.getSpecFull = function(sections){
    'use strict';

    var output = {};

    output.headResources = this.getSpecResources() || {};
    output.bodyResources = this.getSpecResources('body') || {};

    if (sections) {
        output.contents = this.getContentsBySection(sections);
    } else {
        output.contents = this.specHTMLContents;
    }

    return (output.contents || output.headResources || output.bodyResources) ? output : undefined;
};


/**
 * Getter for assets resources of the Spec
 *
 * @param {String} [scope] - "head" or "body", "head" is used by default
 *
 * @returns {Object} Returns object with HTML lists containing Spec assets resources OR undefined
 */
SourceGetSections.prototype.getSpecResources = function(scope){
    'use strict';

    var _scope = scope === 'body' ? document.body : document.head;

    var output = {};

    output.cssLinks = this.getCssLinksHTML(_scope);
    output.scripts = this.getScriptsHTML(_scope);
    output.cssStyles = this.getStyleContainersHTML(_scope);

    return (output.cssLinks || output.scripts || output.cssStyles) ? output : undefined;
};