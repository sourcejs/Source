var fs = require('fs');
var path = require('path');
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
ParseData.prototype.getAll = function(){
    var output = {};

    if (this.dataEsixts()) {
        output = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
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


// TODO apply filters after flattern
ParseData.prototype.getFilteredData = function(filterConf){
    var data = this.getAll();
    var output = {};
};

ParseData.prototype.getByID = function(id){
    var target = id;
    var data = this.getAll();
    var targetData = data[target];

    if (targetData) {
        return data[target];
    } else {
        return false
    }
};

module.exports = ParseData;