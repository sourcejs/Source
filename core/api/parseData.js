var fs = require('fs');
var path = require('path');
var util = require('util');

/**
 * ParseData Constructor
 *
 * @class ParseData
 * @constructor
 * @param {Object} config
 * @param {String} config.scope - data scope (specs/html)
 * @param {String} config.path - path do data
 */
function ParseData(config) {
    this.data = {};
    this.scope = config.scope;
    this.dataPath = config.path;
}

/**
 * Update data
 */
ParseData.prototype.updateData = function(){
    try {
        this.data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
    } catch(e){
        console.warn('Api data of ' + this.scope + ' does not exist, please fix it.');
        console.warn('Error: ' + e);
        return false;
    }

    this.flattenTillSpec();

    if (this.scope === 'specs') {
        this.removeCatalogueDescription();
    }

    return true;
};

/**
 * Removing catalogue description objects
 *
 * @param {Object} [data] - Data object wil all specs/html
 *
 * @returns {Object} Return data without catalogue description
 */
ParseData.prototype.removeCatalogueDescription = function(data){
    var output = {};
    var _data = data || this.data;

    Object.keys(_data).forEach(function (key) {
        var value = _data[key];

        if (value['role'] === 'navigation') return;

        output[key] = value;
    });

    this.data = output;
    return output;
};

/**
 * Flatten given data
 *
 * @param {Object} [data] - Data object wil all specs/html
 *
 * @returns {Object} Return flattened data
 */
ParseData.prototype.flattenTillSpec = function(data){
    var delimiter = '/';
    var output = {};
    var _data = data || this.data;

    var step = function(object, prev) {
        Object.keys(object).forEach(function (key) {
            var value = object[key];

            var isSpecFile = key === 'specFile';

            var keyAppend = isSpecFile ? '' : delimiter + key;
            var newKey = prev ? prev + keyAppend : key;

            if (typeof value === 'object' && !isSpecFile) {
                return step(value, newKey)
            }

            output[newKey] = value;
        })
    };
    step(_data);

    this.data = output;
    return output;
};

/**
 * Get all data
 *
 * @returns {Object|Boolean} Return flat all data object with all items or false boolean
 */
ParseData.prototype.getAll = function(){
    return this.updateData() ? this.data : false;
};

/**
 * Filter placeholder function
 *
 * @param {Object} value - One item data, simple object without nesting
 * @param {Number} inOut - 0 or 1, for filtering and filteringOut
 * @param {Array} filterArr - Array with filtering params
 * @param {Function} filterFunc - callback function
 *      example: filterFunc(filterItem) — accepts data item key for param
 *
 * @returns {Boolean} Return boolean with filter result
 */
ParseData.prototype._filter = function(value, inOut, filterArr, filterFunc){
    var passesFilter = true;

    if (util.isArray(filterArr)) {
        filterArr.map(function(filterItem){

            if (filterFunc(filterItem)) passesFilter = false;

        });
    }

    return passesFilter;
};

/**
 * Filtering by fields
 *
 * @param {Object} value - One item data, simple object without nesting
 * @param {Number} inOut - 0 or 1, for filtering and filteringOut
 * @param {Array} filterArr - Array with filtering params
 *
 * @returns {Boolean} Return boolean with final filter result
 */
ParseData.prototype.filterFields = function(value, inOut, filterArr){
    return this._filter(value, inOut, filterArr, function(filterItem){
        return !!value[filterItem] === !!inOut;
    });
};

/**
 * Filtering by tags
 *
 * @param {Object} value - One item data, simple object without nesting
 * @param {Number} inOut - 0 or 1, for filtering and filteringOut
 * @param {Array} filterArr - Array with filtering params
 *
 * @returns {Boolean} Return boolean with final filter result
 */
ParseData.prototype.filterTags = function(value, inOut, filterArr){
    return this._filter(value, inOut, filterArr, function(filterItem){
        return (value.cat && value.cat.indexOf(filterItem) > -1) === !!inOut;
    });
};

/**
 * Filtering by category
 *
 * @param {Object} value - One item data, simple object without nesting
 * @param {String} key - Current key of looped object
 * @param {Number} inOut - 0 or 1, for filtering and filteringOut
 * @param {Array} filterArr - Array with filtering params
 *
 * @returns {Boolean} Return boolean with final filter result
 */
ParseData.prototype.filterCats = function(value, key, inOut, filterArr){
    return this._filter(value, inOut, filterArr, function(filterItem){
        return (key.lastIndexOf(filterItem, 0) === 0) === !!inOut;
    });
};

/**
 * Filters given data by provided conf
 *
 * @param {Object} filterConf - Filter configuration
 *
 * @param {Object} filterConf.filter - Check if exists
 *      @param {Array} filterConf.filter.fields - Array with fields to filter
 *      @param {Array} filterConf.filter.cats - Array with cats to filter
 *      @param {Array} filterConf.filter.tags - Array with tags to filter
 *
 * @param {Object} filterConf.filterOut - Check if not exists
 *      @param {Array} filterConf.filterOut.fields - Array with fields to filter
 *      @param {Array} filterConf.filterOut.cats - Array with cats to filter
 *      @param {Array} filterConf.filterOut.tags - Array with tags to filter
 *
 * @param {Object} [data] - Data to filter
 *
 * @returns {Object|Boolean} Returns object with filtered data or false boolean
 */
ParseData.prototype.getFilteredData = function(filterConf, data){
    var _this = this;
    var _data = {};
    var dataExists = true;
    var output = {};

    if (data) {
        _data = data;
    } else {
        _data = this.data;
        dataExists = this.updateData();
    }

    if (dataExists) {
        Object.keys(_data).forEach(function (key) {
            var value = _data[key];
            var filterObj = filterConf.filter;
            var filterOutObj = filterConf.filterOut;

            // Filtering categories out
            if (filterObj && filterObj.cats && !_this.filterCats(value, key, 0, filterObj.cats)) return;
            if (filterOutObj && filterOutObj.cats && !_this.filterCats(value, key, 1, filterOutObj.cats)) return;

            // Filtering by existing and not empty fields
            if (filterObj && filterObj.fields && !_this.filterFields(value, 0, filterObj.fields)) return;
            if (filterOutObj && filterOutObj.fields && !_this.filterFields(value, 1, filterOutObj.fields)) return;

            // Filtering by tags
            if (filterObj && filterObj.tags && !_this.filterTags(value, 0, filterObj.tags)) return;
            if (filterOutObj && filterOutObj.tags && !_this.filterTags(value, 1, filterOutObj.tags)) return;

            output[key] = value;
        });

        return output;
    } else {
        return false;
    }
};

/**
 * Get item by ID
 *
 * @param {String} id - Request body
 *
 * @returns {Object|Boolean} Return single object by requested ID or false boolean
 */
ParseData.prototype.getByID = function(id){
    var dataExists = this.updateData();
    var targetData = this.data[id];

    return dataExists && targetData ? targetData : false;
};

module.exports = ParseData;