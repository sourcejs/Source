var fs = require('fs');
var path = require('path');
var util = require('util');
var pathToApp = path.dirname(require.main.filename);

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

ParseData.prototype.dataEsixts = function(){
    return fs.existsSync(this.dataPath);
};

ParseData.prototype.removeCatalogueDescription = function(data){
    var output = {};

    Object.keys(data).forEach(function (key) {
        var value = data[key];

        if (value.role === 'navigation') return;

        output[key] = value;
    });

    return output;
};

// Return flat item list
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

ParseData.prototype.filterFields = function(value, inOut, filterArr){
    var def = inOut === 0;
    var write = def;
    var runCount = 0;

    if (util.isArray(filterArr)) {
        filterArr.map(function(item){

            if (!value[item]) write = !def;

            runCount++;
        });
    }

    return write;
};

ParseData.prototype.filterTags = function(value, inOut, filterArr){
    var write = inOut === 0;

    if (util.isArray(filterArr)) {
        filterArr.map(function(item){

//            if (write === (inOut !== 0)) {

                if (util.isArray(value.cat)) {
                    value.cat.map(function(tag){
                        if (item !== tag) write = inOut !== 0;
                    });
                } else {
                    write = inOut !== 0;
                }

//            }

        });
    }

    return write;
};

/*
 filterConf (Object) = {
     filter: {},
     filterOut: {}
 }

 filter/filterOut params = {
     fields: [],
     cats: [],
     tags: []
 }
*/
ParseData.prototype.getFilteredData = function(filterConf, body){
    var _this = this;
    var data = this.getAll(body);
    var output = {};

    Object.keys(data).forEach(function (key) {
        var value = data[key];
        var write = true;
        var filterFields = true;
        var filterOutFields = true;

        // Filtering by existing and not empty fields
        if (filterConf.filter && filterConf.filter.fields) {
            filterFields = _this.filterFields(value, 0, filterConf.filter.fields);
        }
        if (filterConf.filterOut && filterConf.filterOut.fields) {
            filterOutFields = _this.filterFields(value, 1, filterConf.filterOut.fields);
        }

        // Filtering by tags
//        if (filterConf.filter && filterConf.filter.tags) {
//            write = _this.filterTags(value, 0, filterConf.filter.tags);
//        }
//        if (filterConf.filterOut && filterConf.filterOut.tags) {
//            write = _this.filterTags(value, 1, filterConf.filterOut.tags);
//        }

        write = filterFields && filterOutFields;

        if (!write) return;
        output[key] = value;
    });

    return output;
};

ParseData.prototype.getByID = function(body){
    var target = body.id;
    var data = this.getAll(body);
    var targetData = data[target];

    if (targetData) {
        return data[target];
    } else {
        return false
    }
};

module.exports = ParseData;