/**
 * Independent parser module,
 * cant be used on native html document.
 */


HTMLCollection.prototype.toArray = function toArray() {
    return [].slice.call(this);
};

var
    config = {
        // include params from opt@argument first
//        section: 'source_section',
        code: 'source_example',
        h2: 'source_section_h',
        h3: 'H3',
        h4: 'H4',
        timeout: 3000
    },

    _h2 = 0, _h3 = 0, _h4 = 0,

    specData = [],
    sections,
    elem,
    prevFlag,
    root = false
    ;

// add attemps limit
function getSections() {
    sections = document.getElementsByClassName(config.h2).toArray();

    /* If specs arent ready, trying again after 200ms*/
    if (sections[0]) {
//console.log('Finded.', sections[0]);
        for (var i = 0, l = sections.length; i < l; i++) {
            elem = sections[i];
            specData.push(parse(elem));
        }

        return;
    } else {
        setTimeout(getSections, 200);
    }
}

function parse(section) {
    _h2++;
    _h3 = 0;
    _h4 = 0;

    return new Spec(section);
}

function Spec(section) {
//    level++;
    if (section.next){
        elem = (elem)? elem.nextElementSibling : null;
    }

    console.log('Spec starts...#level', elem);

    // this.html = getHTML(elem); // @Array with code
    // this.ID = returnId();
    this.header = section.header || getHeader(elem);
    this.nested = [];

    while (elem) {
//console.log('WHILE ROOT: '+ root);
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

//console.log('WHILE with: ' + tag + '.'+ cls +' and flag: ' + flag +' (prev:'+ prevFlag +')');

        if (flag === 'H2') {
            this.header = getHeader(elem);
            prevFlag = flag;
        }
        else if (flag === 'CODE') {
            this.html = getHTML(elem);
        }
        else if (flag === 'H3') {
            if (prevFlag == 'H4') {
                root = true;
            }

            if (prevFlag == 'H3' || prevFlag == 'H4') {
                prevFlag = null;
                elem = elem.previousElementSibling;
                break;
            }
            _h3++;
            _h4 = 0;
//            console.log('--> h3 Recursion start.')
            prevFlag = flag;
            this.nested.push(new Spec({header: getHeader(elem), next: true}));
//            console.log('<-- h3 Recursion ends.')
        }
        else if (flag === 'H4') {
            if (prevFlag == flag) {
                prevFlag = null;
                elem = elem.previousElementSibling;
                break;
            }
            _h4++;
//console.log('--> h4 Recursion start.')
            prevFlag = flag;
            this.nested.push(new Spec({header: getHeader(elem), next: true}))
//console.log('<-- h4 Recursion ends.')
        }

//        prevFlag = flag;
        if (elem) elem = elem.nextElementSibling;
    }

//console.log('--> Spec ends.');
//    level--;
}

function returnId() {
    return [_h2, _h3, _h4].join('.');
}

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
    return (tag == 'H2' && cls.match(RegExp('\\b'+ config.h2 + '\\b')))? 'H2' : false;
}

function isH3(tag, cls) {
    return (tag == 'H3')? 'H3' : false;
}

function isH4(tag, cls) {
    return (tag == 'H4')? 'H4': false;
}

function isCode(tag, cls) {
    return (tag == 'SECTION' && cls.match(RegExp('\\b'+ config.code + '\\b')))? 'CODE' : false;
}

/* Start parser */
sections = getSections();
