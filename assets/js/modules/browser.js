'use strict';

sourcejs.amd.define([
    'jquery',
    'sourceLib/jquery.mb.browser'
], function($) {
    //Browser context classes
    var browserClasses = {
        msie: "ie",
        opera: "opera",
        mozilla: "mozilla",
        webkit: "webkit"
    };

    var classString = "";

    if ($.browser.msie) {
        classString += browserClasses.msie;
        classString += " " + browserClasses.msie + $.browser.version;
    } else if ($.browser.opera) {
        classString += browserClasses.opera;
        classString += " " + browserClasses.opera + $.browser.version;
    } else if ($.browser.mozilla) {
        classString += browserClasses.mozilla;
        classString += " " + browserClasses.mozilla + $.browser.version;
    } else if ($.browser.webkit) {
        classString += browserClasses.webkit;
        classString += " " + browserClasses.webkit + $.browser.version;
    } else {
        classString += $.browser.name.toLowerCase();
    }

    $('html').addClass(classString);

    return $.browser;
});
