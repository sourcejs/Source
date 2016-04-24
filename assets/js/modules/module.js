'use strict';

var options = require('../../../options.js').assets;

function Module() {
    this.options = {};
    this.setOptions(this.loadOptions());
}

Module.prototype.loadOptions = function () {
    return options;
};

Module.prototype.setOptions = function (opts) {
    this.options = opts;
    return this.options;
};

Module.prototype.getOptions = function () {
    return this.options;
};

Module.prototype.getClass = function () {
    return this.constructor.name;
};

Module.prototype.createInstance = function () {
    return new this.constructor();
};

module.exports = new Module();