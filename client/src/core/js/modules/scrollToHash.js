//In separate module, to trace script ready state
define([
    "modules/utils",
    "modules/sectionFolding"
    ], function(utils) {
    var navHash = utils.parseNavHash();

    if (navHash != '') {
        utils.scrollToSection(navHash);
    }
});