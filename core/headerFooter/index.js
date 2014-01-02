var fs = require('fs'),
    ejs = require('ejs');

exports.getHeaderAndFooter = function () {
    var defaultTemplatePath = global.app.get('specs path') + "/core/templates/";
    var userTemplatePath = global.app.get('specs path') + "/user/templates/";
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