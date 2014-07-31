var fs = require('fs'),
    path = require('path'),
    pathToApp = path.dirname(require.main.filename),
    ejs = require('ejs');

exports.getHeaderAndFooter = function () {
    var defaultTemplatePath = pathToApp + "/assets/templates/",
        userTemplatePath = global.app.get('user') + "/assets/templates/",
        headerFile = "header.inc.html",
        footerFile = "footer.inc.html";

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