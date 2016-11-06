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
        lodash: '/source/assets/js/lib/lodash',

        // Require.js plugins
        text: '/source/assets/js/lib/text',

        // Relative to user root
        js: '/assets/js',
        plugins: '/plugins',
        node_modules: '/node_modules'
    },

    map: {
      // '*' means all modules will use private versions
      '*': {
          'jquery': 'sourceLib/jquery-private',
          'lodash': 'sourceLib/lodash-private',
          'sourceLib/lodash': 'sourceLib/lodash-private'
      },

      // but private version should first render the original ones
      'sourceLib/jquery-private': { 'jquery': 'jquery' },
      'sourceLib/lodash-private': { 'lodash': 'lodash' }
    }
});
