var webpack = require('webpack');

var isProd = process.env.NODE_ENV === 'production';

module.exports = {
    entry: __dirname + "/assets/js/enter-the-source.js",
    output: {
        path: __dirname + "/build/assets/js",
        filename: "enter-the-source.js"
    },
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: "html"
            }
        ]
    },
    resolveLoader: {
        alias: {
            "text": "html"
        }
    },
    resolve: {
        alias: {
            source: __dirname + "/assets/js",
            sourceModules: __dirname + "/assets/js/modules",
            sourceLib: __dirname + "/assets/js/lib",
            sourceTemplates: __dirname + "/assets/templates"
        }

        // TODO: More require shorthands
        // js: '/assets/js',
        // plugins: '/plugins',
        // node_modules: '/node_modules'
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})
    ]
};

if (!isProd) {
  // http://webpack.github.io/docs/cli.html#development-shortcut-d
  module.exports.debug = true;
  module.exports.devtool = 'eval-cheap-module-source-map';
  module.exports.output.pathinfo = true;
}