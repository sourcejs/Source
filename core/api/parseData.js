'use strict';

var fs = require('fs');
var util = require('util');
var flattenTillSpec = require('./flattenTillSpec');

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
 * Update data and return data status
 *
 * @returns {Boolean} Return data status
 */
ParseData.prototype.updateData = function() {
    try {
        this.data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
    } catch(e) {
        console.warn('Api data of ' + this.scope + ' does not exist, please fix it.');
        console.warn('Error: ', e);
        return false;
    }

    this.data = flattenTillSpec(this.data);

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
ParseData.prototype.removeCatalogueDescription = function(data) {
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
 * Get all data
 *
 * @returns {Object} Return flat all data object with all items
 */
ParseData.prototype.getAll = function() {
    return this.updateData() ? this.data : undefined;
};

/**
 * Get raw
 *
 * @returns {Object} Return nested, raw data object with all items
 */
ParseData.prototype.getRaw = function() {
    try {
        return JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
    } catch(e) {
        console.warn('Api data of ' + this.scope + ' does not exist, please fix it.');
        console.warn('Error: ', e);
        return undefined;
    }
};

/**
 * Filter placeholder function
 *
 * @param {Object} value - One item data, simple object without nesting
 * @param {Boolean} inOut - for filtering and filteringOut
 * @param {Array} filterArr - Array with filtering params
 * @param {Function} filterFunc - callback function
 *      example: filterFunc(filterItem) — accepts data item key for param
 *
 * @returns {Boolean} Return boolean with filter result
 */
ParseData.prototype._filter = function(filterArr, filterFunc){
    var passesFilter = true;

    if (util.isArray(filterArr)) {
        filterArr.map(function(filterItem) {

            if (!filterFunc(filterItem)) passesFilter = false;

        });
    }

    return passesFilter;
};

/**
 * Filtering by fields
 *
 * @param {Object} value - One item data, simple object without nesting
 * @param {Boolean} inOut - for filtering and filteringOut
 * @param {Array} filterArr - Array with filtering params
 *
 * @returns {Boolean} Return boolean with final filter result
 */
ParseData.prototype.filterFields = function(value, inOut, filterArr) {
    return this._filter(filterArr, function(filterItem) {
        return Boolean(value[filterItem]) === inOut;
    });
};

/**
 * Filtering by tags
 *
 * @param {Object} value - One item data, simple object without nesting
 * @param {Boolean} inOut - for filtering and filteringOut
 * @param {Array} filterArr - Array with filtering params
 *
 * @returns {Boolean} Return boolean with final filter result
 */
ParseData.prototype.filterTags = function(value, inOut, filterArr) {
    return this._filter(filterArr, function(filterItem) {
        if(!util.isArray(value.tag)) {
            return false === inOut;
        } else {
            return (value.tag.indexOf(filterItem) > -1) === inOut;
        }
    });
};

/**
 * Filtering by category
 *
 * @param {Object} value - One item data, simple object without nesting
 * @param {String} key - Current key of looped object
 * @param {Boolean} inOut - for filtering and filteringOut
 * @param {Array} filterArr - Array with filtering params
 *
 * @returns {Boolean} Return boolean with final filter result
 */
ParseData.prototype.filterCats = function(value, key, inOut, filterArr) {
    return this._filter(filterArr, function(filterItem) {
        return Boolean(key.lastIndexOf(filterItem, 0)) !== inOut;
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
 * @param {Boolean} [array] - Set true, if you want to get array as resposne
 * @param {Object} [data] - Data to filter
 *
 * @returns {Object} Returns object or array with filtered data or undefined
 */
ParseData.prototype.getFilteredData = function(filterConf, array, data) {
    var _this = this;
    var _data = {};
    var dataExists = true;
    var output = {};

    if (array) {
        output = [];
    }

    if (data) {
        _data = data;
    } else {
        dataExists = this.updateData();
        _data = this.data;
    }

    if (dataExists) {
        Object.keys(_data).forEach(function (key) {
            var value = _data[key];
            var filterObj = filterConf.filter;
            var filterOutObj = filterConf.filterOut;

            // Filtering categories out
            if (filterObj && filterObj.cats && !_this.filterCats(value, key, true, filterObj.cats)) return;
            if (filterOutObj && filterOutObj.cats && !_this.filterCats(value, key, false, filterOutObj.cats)) return;

            // Filtering by existing and not empty fields
            if (filterObj && filterObj.fields && !_this.filterFields(value, true, filterObj.fields)) return;
            if (filterOutObj && filterOutObj.fields && !_this.filterFields(value, false, filterOutObj.fields)) return;

            // Filtering by tags
            if (filterObj && filterObj.tags && !_this.filterTags(value, true, filterObj.tags)) return;
            if (filterOutObj && filterOutObj.tags && !_this.filterTags(value, false, filterOutObj.tags)) {
                if ( !(filterObj && filterObj.forceTags && _this.filterTags(value, true, filterObj.forceTags)) )  {
                    return;
                }
            }

            if (array) {
                output.push(value);
            } else {
                output[key] = value;
            }
        });

        return output;
    } else {
        return undefined;
    }
};

/**
 * Get item by ID
 *
 * @param {String} id - Request body
 *
 * @returns {Object} Return single object by requested ID or false boolean
 */
ParseData.prototype.getByID = function(id) {
    var dataExists = this.updateData();
    var targetData = this.data[id];

    return dataExists && targetData ? targetData : undefined;
};

module.exports = ParseData;