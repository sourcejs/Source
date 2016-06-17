'use strict';

/**
 * Flatten given data
 *
 * @param {Object} [data] - Data object wil all specs/html
 *
 * @returns {Object} Return flattened data
 */
module.exports = function(data) {
    var delimiter = '/';
    var output = {};
    var _data = data;

    if (!_data) {
        console.warn('flattenTillSpec: no data provided, can\'t flatten.');

        return output;
    }

    var step = function(object, prev) {
        if (!object) return;

        Object.keys(object).forEach(function (key) {
            var value = object[key];

            var isSpecFile = key === 'specFile';

            var keyAppend = isSpecFile ? '' : delimiter + key;
            var newKey = prev ? prev + keyAppend : key;

            if (typeof value === 'object' && !isSpecFile) {
                return step(value, newKey);
            }

            output[newKey] = value;
        });
    };
    step(_data);

    return output;
};
