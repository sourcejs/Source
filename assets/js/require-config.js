// Joined to require.bundle.js

requirejs.config({
    paths: {
        // /source/assets requests are routed to /assets
        source: '/source/assets/js',
        sourceModules: '/source/assets/js/modules',
        sourceLib: '/source/assets/js/lib',
        sourceJam: '/source/assets/jam',
        sourceTemplates: '/source/assets/templates',

        // Require.js plugins
        text: '/source/assets/js/lib/text',

        // Relative to user root
        js: '/assets/js',
        plugins: '/plugins',
        node_modules: '/node_modules'
    }
});