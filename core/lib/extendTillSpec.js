'use strict';

/**
 * Extend object till "specFile" key
 *
 * @param {Object} target - Target data that will be extended
 * @param {Object} source - Source data to extend with
 *
 * @returns {Object} Return extended data
 */
var extendTillSpec = module.exports = function(target, extender) {
    for (var key in extender) {
        if (extender.hasOwnProperty(key)) {

            if (!(key in extender)) continue;

            var src = target[key];
            var val = extender[key];

            if (val === target) continue;

            if (typeof val !== 'object' || key === "specFile" || val === null) {
                target[key] = val;
                continue;
            }

            if (typeof src !== 'object' || src === null) {
                target[key] = extendTillSpec({}, val);
                continue;
            }

            target[key] = extendTillSpec(src, val);
        }
    }

    return target;
};
