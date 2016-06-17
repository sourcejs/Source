'use strict';

var fs = require('fs');
var util = require('util');
var path = require('path');
var flattenTillSpec = require(path.join(global.pathToApp, 'core/lib/flattenTillSpec'));

/**
 * ParseData Constructor for working with Specs File tree and HTML tree
 *
 * @class ParseData
 * @constructor
 * @param {Object} config
 * @param {String} config.scope - data scope (specs/html)
 * @param {String} config.path - path do data
 */
function ParseData(config) {
    config = config || {};

    this.data = {};
    this.scope = config.scope;
    this.dataPath = config.path;
}

/**
 * Update data and return data status
 *
 * @param {Boolean} [withCategories] - get categories info either
 *
 * @returns {Boolean} Return data status
 */
ParseData.prototype.updateData = function(withCategories) {
    try {
        this.data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
    } catch(e) {
        return false;
    }

    this.data = flattenTillSpec(this.data);

    if (this.scope === 'specs' && !withCategories) {
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
 * @param {Boolean} [withCategories] - get categories info either
 *
 * @returns {Object} Return flat all data object with all items
 */
ParseData.prototype.getAll = function(withCategories) {
    return this.updateData(withCategories) ? this.data : undefined;
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
        console.warn('Parse Data: Api data of ' + this.scope + ' does not exist, please update HTML API data.');
        console.warn('Error: ', e);
        return undefined;
    }
};

/**
 * Filter placeholder function
 *
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
 * @param {String} id - Request some item by id (for example "base/btn")
 *
 * @returns {Object} Return single object by requested ID, null (no id found) or undefined (no data found)
 */
ParseData.prototype.getByID = function(id) {
    // TODO: fix flat id's list, to remove this hack
    if (id === '/') id = 'specFile';

    var dataExists = this.updateData();
    var targetData = this.data[id];

    if (!dataExists) return undefined;
    if (!targetData) return null;

    return targetData;
};

/**
 * Flatten contents of Spec HTML object
 *
 * @param {Object} contents - Nested Spec HTML contents object
 *
 * @returns {Object} Return flat object with contents, grouped by section ID
 */
ParseData.prototype.flattenHTMLcontents = function(contents) {
    var flatList = {};

    var parseContents = function(contents){
        for (var i=0; contents.length > i ; i++) {
            var current = contents[i];

            flatList[current.id] = current;

            if (current.nested.length > 0) {
                parseContents(current.nested);
            }
        }
    };

    parseContents(contents);

    return flatList;
};

/**
 * Get specific sections of defined Spec HTML
 *
 * @param {String} id - Request some item by id (for example "base/btn") and sections
 * @param {Array} sections - Array of sections to return
 *
 * @returns {Object} Return single object by requested ID, with specified sections HTML OR undefined
 */
ParseData.prototype.getBySection = function(id, sections) {
    // Sections are defined only in html data storage
    if (this.scope === 'html' && Array.isArray(sections) && sections.length > 0) {
        return this.traverseSections(this.getByID(id), sections);
    } else {
        return undefined;
    }
};

/**
 * Traverse Spec page object sections
 *
 * @param {Object} specData - HTML data structure to parse
 * @param {Array} sections - Array of sections to return
 *
 * @returns {Object} Return single object by requested ID with specified sections HTML OR undefined
 */
ParseData.prototype.traverseSections = function(specData, sections) {
    if (specData && sections) {
        var specSections = this.flattenHTMLcontents(specData.contents);

        var pickedSections = [];

        sections.forEach(function(sectionID){
            var objectToAdd = specSections[sectionID];

            if (objectToAdd) pickedSections.push(objectToAdd);
        });

        if (pickedSections.length > 0) {
            specData.contents = pickedSections;

            return specData;
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
};

module.exports = ParseData;
