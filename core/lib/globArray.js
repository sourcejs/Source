'use strict';

var glob = require('glob');
var minimatch = require("minimatch");

module.exports = function (patterns, options) {
    var i, list = [];
    if (!Array.isArray(patterns)) {
        patterns = [patterns];
    }

    patterns.forEach(function (pattern) {
        if (pattern[0] === "!") {
            i = list.length - 1;
            while (i > -1) {
                if (!minimatch(list[i], pattern)) {
                    list.splice(i, 1);
                }
                i--;
            }

        }
        else {
            var newList = glob.sync(pattern, options);
            newList.forEach(function (item) {
                if (list.indexOf(item) === -1) {
                    list.push(item);
                }
            });
        }
    });

    return list;
};
