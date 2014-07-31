// Joined to require.bundle.js

requirejs.config({
    baseUrl: '/source/assets/js',

    paths: {
        text: 'lib/text',

        // /source/assets requests are routed to /assets
        source: '/source/assets/js',
        sourceModules: '/source/assets/js/modules',
        sourceLib: '/source/assets/js/lib',
        sourceJam: '/source/assets/jam',
        sourceTemplates: '/source/assets/templates',

        // relative to user root
        js: '/assets/js',
        plugins: '/plugins',
        node_modules: '/node_modules'
    }
});