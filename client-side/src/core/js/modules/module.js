define(["core/options"], function (options) {

    function Module() {
        this.options = {};
        this.setOptions(this.loadOptions());
    }

    Module.prototype.loadOptions = function () {
        return options;
    };

    Module.prototype.setOptions = function (opts) {
        return this.options = opts;
    };

    Module.prototype.getOptions = function () {
        return this.options;
    };

    Module.prototype.getClass = function () {
        return this.constructor.name;
    };

    Module.prototype.createInstance = function () {
        return new this.constructor;
    };

    return new Module();

});