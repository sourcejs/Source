'use strict';

var fs = require('fs');
var ejs = require('ejs');

exports.getHeaderAndFooter = function () {
    var defaultTemplatePath = global.pathToApp + '/assets/templates/';
    var userTemplatePath = global.app.get('user') + '/assets/templates/';
    var headerFile = 'header.inc.html';
    var footerFile = 'footer.inc.html';

    var output = {};

    var userHeaderTplPath = userTemplatePath + headerFile;
    var headerTplPath = fs.existsSync(userHeaderTplPath) ? userHeaderTplPath : defaultTemplatePath + headerFile;

    var userFooterTplPath = userTemplatePath + footerFile;
    var footerTplPath = fs.existsSync(userFooterTplPath) ? userFooterTplPath : defaultTemplatePath + footerFile;

    output.header = ejs.render(fs.readFileSync(headerTplPath, 'utf-8'));
    output.footer = ejs.render(fs.readFileSync(footerTplPath, 'utf-8'), {
        engineVersion: global.engineVersion
    });

    return output;
};