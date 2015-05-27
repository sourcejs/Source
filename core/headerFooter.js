'use strict';

var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

exports.getHeaderAndFooter = function () {
    var defaultTemplatePath = path.join(global.pathToApp, 'assets/templates');
    var userTemplatePath = path.join(global.app.get('user'), 'assets/templates');
    var headerFile = 'header.inc.html';
    var footerFile = 'footer.inc.html';

    var output = {};

    var userHeaderTplPath = path.join(userTemplatePath, headerFile);
    var headerTplPath = fs.existsSync(userHeaderTplPath) ? userHeaderTplPath : path.join(defaultTemplatePath, headerFile);

    var userFooterTplPath = path.join(userTemplatePath, footerFile);
    var footerTplPath = fs.existsSync(userFooterTplPath) ? userFooterTplPath : path.join(defaultTemplatePath, footerFile);

    output.header = ejs.render(fs.readFileSync(headerTplPath, 'utf-8'));
    output.footer = ejs.render(fs.readFileSync(footerTplPath, 'utf-8'), {
        engineVersion: global.engineVersion
    });

    return output;
};