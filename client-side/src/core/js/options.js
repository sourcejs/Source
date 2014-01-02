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
            specAssets: true,
            scrollToHash: true,
            sections: true,
            globalNav: true,
            search: true,
            navHighlight: true,
            headerFooter: true
        },

        modulesOptions : {
            innerNavigation : {
                hashSymb: '!'
            },
            specAssets : {
                postponedInit : true
            },
            search: {
            	replacePathBySectionName: false // replace spec's path by root parent's dir name from json.info
            }
        },

        pluginsEnabled: {

        },

        // Page classes
        containerClass : 'source_container',
        headerClass : 'source_header',
        SECTION_CLASS : 'source_section',
        exampleSectionClass : 'source_example',
        mainClass : 'source_main',
        mainNav : 'source_main_nav',

        colMain : 'source_col-main',

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