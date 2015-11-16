// Default SourceJS engine configuration

module.exports = {

    // Restart the app after changing core (back-end) options
    // Core options could be only redefined from user/options.js, context options are not supported
    core : {
        common: {
            defaultLogLevel: 'INFO',
            defaultProdLogLevel: 'ERROR',
            includedDirs: ['docs', 'test'],
            specPaths: ['specs'],

            // Turn on context level setting
            contextOptions: true,

            // Name of context level settings file
            contextOptionsFile: 'sourcejs-options.js',

            // Custom path to user contents path, relative to SourceJS root
            // Used only in case if SourceJS installed as a parent folder for content (old approach)
            pathToUser: 'user',

            // Name of spec meta info file
            infoFile: 'info.json',

            // Name of options field in info.json, used to override configuration per spec
            infoFileOptions: 'sourcejs'
        },

        // Server options are passed to app.listen (https://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback)
        server: {
            port: 8080,
            hostname: undefined
        },

        api: {
            specsData: 'core/api/data/pages-tree.json',
            htmlData: 'core/api/data/html.json',
            specsTestData: 'test/data/api-test-specs.json',
            htmlTestData: 'test/data/api-test-html.json'
        },

        // Spec catalogs navigation tree
        fileTree: {
            // Glob excludes for `info.json` search paths
            excludes: [
                '!**/node_modules/**',
                '!**/bower_components/**',
                '!**/.git/**',
                '!**/.idea/**'
            ],

            // Update navigation tree by cron task (setTimeout)
            cron: false,

            // Update navigation tree when somebody visits main page
            mainPageTrigger: false,

            // Default thumbnail file path (relative to each spec)
            thumbnail: 'thumbnail.png'
        },

        watch: {
            enabled: true,
            foreverWatchEnabled: true
        },

        tracking: {
            // Anonymous user statistics tracking.
            // Used to get insights about the community and improve engine usage experience.
            enabled: true
        },

        // Limits EJS includes, allowing only files in project root
        sandboxIncludes: true
    },

    // Page rendering configuration (redefinable from context options)
    rendering: {
        // Define priority of spec file source
        specFiles: [
            'index.src',
            'index.src.html',
            'index.jade', // https://www.npmjs.com/package/sourcejs-jade
            'index.jsx', // https://www.npmjs.com/package/sourcejs-react
            'index.md',
            'readme.md',
            'README.md',
            'index.html'
        ],

        // Define views for rendering SourceJS pages (array order define priority)
        views: {
            defaultViewPaths: [
                '$(user)/core/views',
                '$(sourcejs)/core/views'
            ],
            spec: [
                '$(user)/core/views/spec.ejs',
                '$(sourcejs)/core/views/spec.ejs'
            ],
            navigation: [
                '$(user)/core/views/navigation.ejs',
                '$(sourcejs)/core/views/navigation.ejs'
            ]
        }
    },

    // Client-side options (redefinable from context options)
    assets: {
        // Page classes
        containerClass : 'source_container',
        headerClass : 'source_header',
        SECTION_CLASS : 'source_section',
        exampleSectionClass : 'source_example',
        exampleCleanClass : 'source_clean',
        mainClass : 'source_main',
        mainNav : 'source_main_nav',
        colMain : 'source_col-main',

        // Core modules
        modulesEnabled : {
            // Enable clarify helper links in spec
            clarifyInSpec: true,
            htmlAPISync: true,
            headerFooter: true,
            specDecorations: true,
            codeSource: true,
            sectionFolding: true,
            innerNavigation: true,

            // Trims paces in example sections to emulate HTML minify, off by default
            trimSpaces: false,
            scrollToHash: true,
            sections: true,
            globalNav: true,
            search: true,
            loadEvents: true,
            navHighlight: true,

            // Enable github auth toolbar links
            auth: false
        },

        modulesOptions : {
            navHighlight: {
                // Page navigation hash update on scroll turned off because of performance issues
                updateHash: false
            },

            search: {
                autofocusOnNavigationPage: true,
                autofocusOnSpecPage: false,
                activateOnLoad: true
            }
        },

        // Landing page options for moduleLoader (override without extend)
        navPageModulesBuild: {
            modulesEnabled : {
                headerFooter: true,
                specDecorations: true,
                globalNav: true,
                search: true
            },
            pluginsEnabled: {},
            npmPluginsEnabled: {}
        },

        // Legacy options object support for some older plugins (todo:remove with next major release)
        pluginsOptions: {}
    },

    // External plugins options (are also exposed to client-side
    plugins: {
    },

    /*
     * Please pay your attention. This is DEMO github applicatio key.
     *
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
