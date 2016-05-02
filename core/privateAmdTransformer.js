'use strict';

var interceptor = require('express-interceptor');

module.exports = interceptor(function (req) {
    return {
        isInterceptable: function () {
            return (/\/source\/assets\/js/.test(req.originalUrl) && !(/\/require.bundle.js$/.test(req.originalUrl))) ||
                /\/node_modules\/sourcejs-/.test(req.originalUrl) ||
                /\/plugins\//.test(req.originalUrl);
        },
        intercept: function (body, send) {
            if (
                (/require\(/.test(body) && !(/sourcejs\.amd\.require\(/.test(body))) ||
                (/define\(/.test(body) && !(/sourcejs\.amd\.define\(/.test(body)))
            ) {
                body = '// Modified on static serve from `core/privateAmdTransformer.js` \n (function(require, define){\n' + body + '\n}(sourcejs.amd.require, sourcejs.amd.define))';

                if (!(/\/source\/assets\/js\/lib/.test(req.originalUrl))) {
                    global.log.warn('Deprecation Notice: please update "' + req.originalUrl + '" to use sourcejs.amd.require/sourcejs.amd.define namespace for Requirejs modules. Interception with autofix will be cleaned in the next breaking change release.');
                }
            }

            send(body);
        }
    };
});
