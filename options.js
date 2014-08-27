// Default options for core and assets

module.exports = {

    // Restart app after changing core options
    core : {
        common: {
            pathToUser: 'user',
            port: 8080,
            infoFile: 'info.json',
            extensions: ["src", "jade", "haml"]
        },
        fileTree: {
            includedDirs: ['docs'],
            excludedDirs: ['data', 'plugins', 'node_modules', '.git', '.idea'],
            fileMask: ['index.html', 'index.src'],
            cron: false,
            cronProd: true,
            cronRepeatTime: 60000,
            outputFile: 'data/pages_tree.json'
        },
        specDependenciesTree: {
            enabled: false,
            outputFile: 'data/spec_dependencies_tree.json'
        },
        less: {
            compress: false
        }
    },

    // Run `grunt` after changing assets options. Or use`grunt watch-all`.
    assets: {
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
            navHighlight: true
        },

        modulesOptions : {
            globalNav: {
                filterEnabled: false
            },

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
                search: true,
                navHighlight: true
            },
            pluginsEnabled: {},
            npmPluginsEnabled: {}
        }
    }
};