'use strict';

var _ = require('lodash');

module.exports.requireUncached = function (module) {
    delete require.cache[require.resolve(module)];
    return require(module);
};

module.exports.extendOptions = function () {
    var args = Array.prototype.slice.call(arguments);
    var cb = function (a, b) {
        if (_.isArray(a)) {
            return b;
        }
    };

    args.push(cb);

    // Don't merge arrays
    return _.mergeWith.apply(this, args, function (a, b) {
        if (_.isArray(b)) {
            return b;
        }
    });
};
