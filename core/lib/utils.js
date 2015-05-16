'use strict';

module.exports.requireUncached = function (module) {
    delete require.cache[require.resolve(module)];
    return require(module);
};