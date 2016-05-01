// Joined to require.bundle.js

sourcejs.amd.requirejs.config({
    paths: {
        // /source/assets requests are routed to /assets
        source: '/source/assets/js',
        sourceModules: '/source/assets/js/modules',
        sourceLib: '/source/assets/js/lib',
        sourceTemplates: '/source/assets/templates',

        // libs
        jquery: '/source/assets/js/lib/jquery-2.1.4.min',

        // Require.js plugins
        text: '/source/assets/js/lib/text',

        // Relative to user root
        js: '/assets/js',
        plugins: '/plugins',
        node_modules: '/node_modules'
    },

    map: {
      // '*' means all modules will get 'jquery-private'
      // for their 'jquery' dependency.
      '*': { 'jquery': 'sourceLib/jquery-private' },

      // 'jquery-private' wants the real jQuery module
      // though. If this line was not here, there would
      // be an unresolvable cyclic dependency.
      'sourceLib/jquery-private': { 'jquery': 'jquery' }
    }
});