// Default options for core and assets

module.exports = {

    // Restart app after changing core options
    core : {
        api: {
            specsData: 'core/api/data/pages-tree.json',
            htmlData: 'core/api/data/html.json',
            specsTestData: 'test/data/api-test-specs.json',
            htmlTestData: 'test/data/api-test-html.json'
        },
        parseHTML: {
            onStart: false
        },
        common: {
            pathToUser: 'user',
            defaultLogLevel: 'INFO',
            defaultProdLogLevel: 'ERROR',
            port: 8080,
            infoFile: 'info.json',
            extensions: ["src", "jade", "haml"]
        },
        less: {
            compress: false
        }
    },

    // Run `grunt` after changing assets options. Or use`grunt watch-all`.
    assets: {
        // Core modules
        modulesEnabled : {
            clarifyInSpec: true,
            htmlAPISync: true,
            headerFooter: true,
            specDecorations: true,
            codeSource: true,
            innerNavigation: true,
            trimSpaces: false, //trim spaces in example sections to emulate HTML minify, off by default
            specAssets: true,
            scrollToHash: true,
            sections: true,
            globalNav: true,
            search: true,
            loadEvents: true,
            navHighlight: true,
            exampleTabs: true
        },

        modulesOptions : {
            specAssets : {
                postponedInit : true
            },
            search: {
                autoFocus: false,
                autoFocusOnNavigationPage: true,
            	replacePathBySectionName: false // replace spec's path by root parent's dir name from json.info
            }
        },

        // Page classes
        containerClass : 'source_container',
        headerClass : 'source_header',
        SECTION_CLASS : 'source_section',
        EXAMPLE_CLASS : 'source_example',
        exampleCleanClass : 'source_clean',
        mainClass : 'source_main',
        mainNav : 'source_main_nav',

        colMain : 'source_col-main',

        // Landing page options for moduleLoader (override without extend)
        navPageModulesBuild: {
            modulesEnabled : {
                headerFooter: true,
                specDecorations: true,
                specAssets: true,
                globalNav: true,
                search: true
            },
            pluginsEnabled: {},
            npmPluginsEnabled: {}
        }
    }
};