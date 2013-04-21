define(["modules/utils","modules/sectionFolding"], function(utils) {
    var navHash = utils.parseNavHash(window.location.hash);

    if (navHash != '') {
        utils.scrollToSection(navHash);
    }
});