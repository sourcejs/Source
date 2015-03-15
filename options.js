// Default options for core and assets

module.exports = {

    // Restart app after changing core options
    core : {
        common: {
            pathToUser: 'user',
            defaultLogLevel: 'INFO',
            defaultProdLogLevel: 'ERROR',
            port: 8080,
            infoFile: 'info.json',
            specPaths: ['specs'],
            specFiles: ['index.html', 'index.src', 'index.jade', 'index.haml', 'index.md', 'readme.md', 'README.md']
        },
        api: {
            specsData: 'core/api/data/pages-tree.json',
            htmlData: 'core/api/data/html.json',
            specsTestData: 'test/data/api-test-specs.json',
            htmlTestData: 'test/data/api-test-html.json'
        },
        parseHTML: {
            onStart: false
        },
        fileTree: {
            mainPageTrigger: false
        },
        watch: {
            enabled: true
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
            sectionFolding: true,
            innerNavigation: true,
            trimSpaces: false, //trimspaces in example sections to emulate HTML minify, off by default
            specAssets: true,
            scrollToHash: true,
            sections: true,
            globalNav: true,
            search: true,
            loadEvents: true,
            navHighlight: true,
            auth: false
        },

        modulesOptions : {
            innerNavigation : {
                hashSymb: '!'
            },
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
        exampleSectionClass : 'source_example',
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
    },

    plugins: {
    },

    /*
     * Please pay your attention. This is demo github applicatio key.
     * To get your own one please use github applications service.
     * Please visit this link to get more information:
     * https://developer.github.com/guides/basics-of-authentication/#registering-your-app
     * Current demo key is used in test mode for http://127.0.0.1:8080
     */
    github: {
        appId: 'cf00a9e7ee5d9d6af36f',
        appSecret: 'aebe08e0aa66f6911e4f54df81ce64c9d6e0003b'
    }
};