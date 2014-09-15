'use strict';

var fs = require('fs');
var path = require('path');
var pathToApp = path.dirname(require.main.filename);
var ejs = require('ejs');

exports.getHeaderAndFooter = function () {
    var defaultTemplatePath = pathToApp + "/assets/templates/";
    var userTemplatePath = global.app.get('user') + "/assets/templates/";
    var headerFile = "header.inc.html";
    var footerFile = "footer.inc.html";

    var data = {};

    if(fs.existsSync(userTemplatePath + headerFile)) {
        data.header = ejs.render(fs.readFileSync(userTemplatePath + headerFile, "utf-8"));
    } else {
        data.header = ejs.render(fs.readFileSync(defaultTemplatePath + headerFile, "utf-8"));
    }

    if(fs.existsSync(userTemplatePath + footerFile)) {
        data.footer = ejs.render(fs.readFileSync(userTemplatePath + footerFile, "utf-8"));
    } else {
        data.footer = ejs.render(fs.readFileSync(defaultTemplatePath + footerFile, "utf-8"));
    }

    return data;
};