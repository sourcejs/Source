/*
*
* Utils core for all modules
*
* */

define(["jquery","core/options"], function($, options) {

    var utils = {
        parseNavHash: function (hash) {
            var
                urlHash = hash,
                urlHashSplit = urlHash.split(options.modulesOptions.innerNavigationTmp.hashSymb);

            return urlHashSplit[0];
        },

        scrollToSection: function (sectionID) {
            var
                new_position = $(sectionID).offset(),
                new_position_padding = 60; //Header heights

            if (new_position) {
                window.scrollTo(new_position.left, new_position.top - new_position_padding);
            }
        }
    };

    return utils;
});