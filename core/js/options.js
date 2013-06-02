/*
 *
 * Core options
 *
 * ! not for modifying, use /user/js/core.js !
 *
 * */

define([
    'jquery',
    'modules/inlineOptions',
    'user/js/options'
    ], function($, inlineOptions, userOptions) {

    // Settings
    var sourceOptions = {
        // Core modules
        modulesEnabled : {
            headerFooter: true,
            specDecorations: true,
            codeSource: true,
            sectionFolding: true,
            innerNavigation: true,
            trimSpaces: false, //trimspaces in example sections to emulate HTML minify, off by default
            scrollToHash: true,
            sections: true,
            search: true
        },

        modulesOptions : {
            innerNavgation : {
                hashSymb: '!'
            }
        },

        // Page classes
        language: "ru",
        containerClass : 'source_container',
        headerClass : 'source_header',
        sectionClass : 'source_section',
        exampleSectionClass : 'source_example',
        mainClass : 'source_main',
        mainNav : 'source_main_nav',

        colMain : 'source_col-main',

        //Page roles
        roleNavigation : 'source_page_navigation',

        // Plugins
        pluginsDir: '/plugins/'
    };

    // Default options for landing page
    var landingOptionsExceptions = {
        modulesEnabled : {
            sectionFolding: false,
            innerNavigation: false,
            trimSpaces: false,
            scrollToHash: false,
            sections: false,
            codeSource: false
        }
    };

    // Override with user options
    $.extend(true, sourceOptions, userOptions.sourceOptions);

    // Override options with exceptions
    var isNav = $('meta[name=source-page-role]').attr('content') === 'navigation';
    if (isNav) {
        $.extend(true, sourceOptions, landingOptionsExceptions, userOptions.landingOptionsExceptions);
    }

    // Override with from page inline options
    $.extend(true, sourceOptions, inlineOptions);

    return sourceOptions;
});