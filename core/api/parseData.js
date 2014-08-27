var fs = require('fs');
var path = require('path');
var util = require('util');
var pathToApp = path.dirname(require.main.filename);


/**
 * ParseData Constructor
 *
 * @constructor
 * @param {string} scope - Setting data scope (specs/html)
 */
function ParseData(scope) {
    this.data = {};
    this.scope = scope;

    if (scope === 'html') {
        this.dataPath = path.join(pathToApp, '/html.json');
    } else if (scope === 'specs') {
        this.dataPath = path.join(global.app.get('user'), 'data/pages_tree.json');
    } else {
        console.warn('Scope not defined in ParseData');
    }
}

/** Check if data file exists. */
ParseData.prototype.dataEsixts = function(){
    return fs.existsSync(this.dataPath);
};


/**
 * Removing catalogue description objects
 *
 * @param {Object} data - Data object wil all specs/html
 */
ParseData.prototype.removeCatalogueDescription = function(data){
    var output = {};

    Object.keys(data).forEach(function (key) {
        var value = data[key];

        if (value.role === 'navigation') return;

        output[key] = value;
    });

    return output;
};

/**
 * Get all data
 *
 * @param {Object} body - Request body with params
 *
 * @returns {Object} Flat data object with all itmes
 */
ParseData.prototype.getAll = function(body){
    var output = {};
    var testData = path.join(pathToApp, 'test', 'api-test-' + this.scope + '.json');
    var pathToData = body.test ? testData : this.dataPath;

    if (body.test || this.dataEsixts()) {
        output = JSON.parse(fs.readFileSync(pathToData, 'utf8'));
    }

    output = this.flattenTillSpec(output);

    if (this.scope === 'specs') {
        output = this.removeCatalogueDescription(output);
    }

    this.data = output;
    return output;
};

/**
 * Flatten given data
 *
 * @param {Object} data - Data object wil all specs/html
 *
 * @returns {Object} Return flattened data
 */
ParseData.prototype.flattenTillSpec = function(data){
    var delimiter = '/';
    var output = {};

    var step = function(object, prev) {
        Object.keys(object).forEach(function (key) {
            var value = object[key];
            var type = Object.prototype.toString.call(value);
            var isobject = (
                    type === "[object Object]" ||
                    type === "[object Array]"
                    );

            var isSpecFile = key === 'specFile';

            var keyAppend = isSpecFile ? '' : delimiter + key;
            var newKey = prev ? prev + keyAppend : key;

            if (isobject && !isSpecFile) {
                return step(value, newKey)
            }

            output[newKey] = value;
        })
    };
    step(data);

    return output;
};

/**
 * ParseData._filter callback param
 * @callback filterFuncCallback
 *
 * @param {String} filterItem - name of current filter from Array
 */

/**
 * Filter placeholder function
 *
 * @param {Object} value - One item data, simple object without nesting
 * @param {Number} inOut - 0 or 1, for filtering and filteringOut
 * @param {Array} filterArr - Array with filtering params
 * @param {filterFuncCallback} filterFunc - Function that return boolean with filter check status
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
 * @param {Object} data - Data to filter
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
 * @returns {Object} Returns object with filtered data
 */
ParseData.prototype.getFilteredData = function(data, filterConf){
    var _this = this;
    var output = {};

    Object.keys(data).forEach(function (key) {
        var value = data[key];
        var filterFields = true;
        var filterOutFields = true;
        var filterTags = true;
        var filterOutTags = true;
        var filterCats = true;
        var filterOutCats = true;

        if (filterConf.filter && filterConf.filter.cats) {
            filterCats = _this.filterCats(value, key, 0, filterConf.filter.cats);
        }
        if (filterConf.filterOut && filterConf.filterOut.cats) {
            filterOutCats = _this.filterCats(value, key, 1, filterConf.filterOut.cats);
        }

        var rightCat = filterCats && filterOutCats;
        if (!rightCat) return;


        // Filtering by existing and not empty fields
        if (filterConf.filter && filterConf.filter.fields) {
            filterFields = _this.filterFields(value, 0, filterConf.filter.fields);
        }
        if (filterConf.filterOut && filterConf.filterOut.fields) {
            filterOutFields = _this.filterFields(value, 1, filterConf.filterOut.fields);
        }

        // Filtering by tags
        if (filterConf.filter && filterConf.filter.tags) {
            filterTags = _this.filterTags(value, 0, filterConf.filter.tags);
        }
        if (filterConf.filterOut && filterConf.filterOut.tags) {
            filterOutTags = _this.filterTags(value, 1, filterConf.filterOut.tags);
        }

        var write = filterFields && filterOutFields && filterTags && filterOutTags;

        if (!write) return;
        output[key] = value;
    });

    return output;
};

/**
 * Get item by ID
 *
 * @param {Object} body - Request body
 *
 * @returns {Boolean|Boolean} Return single object by requested ID
 */
ParseData.prototype.getByID = function(body){
    var target = body.id;
    var data = this.getAll(body);
    var targetData = data[target];

    if (targetData) {
        return data[target];
    } else {
        return false;
    }
};

module.exports = ParseData;