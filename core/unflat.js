'use strict';

function unflatten(target, opts) {
    opts = opts || {};

    var delimiter = opts.delimiter || '.';
    var result = {};

    if (Object.prototype.toString.call(target) !== '[object Object]') {
        return target;
    }

    Object.keys(target).forEach(function(key) {
        var split = key.split(delimiter);
        var key1 = split.shift();
        var key2 = split[0];
        var recipient = result;

        while (key2 !== undefined) {
            if (recipient[key1] === undefined) {
                recipient[key1] = {};
            }

            recipient = recipient[key1];
            if (split.length > 0) {
                key1 = split.shift();
                key2 = split[0];
            }
        }

        // unflatten again for 'messy objects'
        if (recipient[key1] === undefined) recipient[key1] = unflatten(target[key], opts);
        // if there is already exist field that may
        // be overwritten with low-level structure
        else if (opts.overwrite) recipient[key1][opts.overwrite] = unflatten(target[key], opts);
    });

    return result;
}

module.exports = unflatten;
