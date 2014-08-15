var fs = require('fs');
var path = require('path');
var pathToApp = path.dirname(require.main.filename);

function ParseData(scope) {
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

ParseData.prototype.getAll = function(){
    if (this.dataEsixts()) {
        this.data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
    }

    return this.data;
};

ParseData.prototype.getByID = function(id){
    var target = id;
    var data = this.getAll();
    var splitTarget = target.split('/');
    var callCount = 0;
    var workingObj;

    splitTarget.map(function (pathPart) {
        if (pathPart === '') return;

        if (callCount === 0 && data) {
            workingObj = data;
        }

        if (workingObj && workingObj[pathPart]) {
            workingObj = workingObj[pathPart];
        } else {
            workingObj = false;
        }

        callCount++;
    });

    if (workingObj && workingObj.specFile) {
        return workingObj.specFile;
    } else {
        return false;
    }
};

module.exports = ParseData;