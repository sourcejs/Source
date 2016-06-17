'use strict';

var fs = require('fs');
var path = require('path');

exports.getHeaderAndFooter = function () {
    var defaultTemplatePath = path.join(global.pathToApp, 'assets/templates');
    var userTemplatePath = path.join(global.userPath, 'assets/templates');
    var headerFile = 'header.inc.html';
    var footerFile = 'footer.inc.html';

    var output = {};

    var userHeaderTplPath = path.join(userTemplatePath, headerFile);
    output.headerPath = fs.existsSync(userHeaderTplPath) ? userHeaderTplPath : path.join(defaultTemplatePath, headerFile);

    var userFooterTplPath = path.join(userTemplatePath, footerFile);
    output.footerPath = fs.existsSync(userFooterTplPath) ? userFooterTplPath : path.join(defaultTemplatePath, footerFile);

    output.header = fs.readFileSync(output.headerPath, 'utf-8');
    output.footer = fs.readFileSync(output.footerPath, 'utf-8');

    return output;
};
