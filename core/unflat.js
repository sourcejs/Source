'use strict';

function unflatten(target, opts) {
    opts = opts || {};

    var delimiter = opts.delimiter || '.',
        result = {};

    if (Object.prototype.toString.call(target) !== '[object Object]') {
        return target;
    }

    // safely ensure that the key is
    // an integer.
    function getkey(key) {
        var parsedKey = Number(key);

        return (isNaN(parsedKey) || key.indexOf('.') !== -1)? key : parsedKey;
    }

    Object.keys(target).forEach(function(key) {
        var split = key.split(delimiter),
            key1 = getkey(split.shift()),
            key2 = getkey(split[0]),
            recipient = result;

        while (key2 !== undefined) {
            if (recipient[key1] === undefined) {
                recipient[key1] = ( (typeof key2 === 'number' && !opts.object)? [] : {});
            }

            recipient = recipient[key1];
            if (split.length > 0) {
                key1 = getkey(split.shift());
                key2 = getkey(split[0]);
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