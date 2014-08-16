var fs = require('fs'),
    ejs = require('ejs'),
    path = require('path'),
    pathToApp = path.dirname(require.main.filename),
    getHeaderAndFooter = require(pathToApp + '/core/headerFooter.js').getHeaderAndFooter;

var userTemplatesDir = global.app.get('user') + "/core/views/",
    coreTemplatesDir = pathToApp + "/core/views/";

/*
* Получаем шаблон: дефолтовый или юзерский, если такой есть в файловой системе
*
* @param {string} name - Template name
* @returns {string}
* */
function getTemplate(name) {
    var output;

    if (fs.existsSync(userTemplatesDir + name)) {
        output = fs.readFileSync(userTemplatesDir + name, "utf-8");
    } else {
        output = fs.readFileSync(coreTemplatesDir + name, "utf-8");
    }

    return output;
}

/*
* Оборачиваем html из реквеста в обертку спеки
*
* @param {object} req - Request object
* @param {object} res - Response object
* @param {function} next - The callback function
* */
exports.process = function (req, res, next) {

    if (req.specData.renderedHtml) {
        // получаем контент спеки
        var data = req.specData.renderedHtml.replace(/^\s+|\s+$/g, '');

        // получаем инфо о спеке
        var info = req.specData.info;

        // получаем хедер и футер из шаблонов
        var headerFooterHTML = getHeaderAndFooter();

        // выбираем нужный шаблон исходя из типа страницы
        var template;
        if (info.template) {
            template = getTemplate(info.template + '.ejs');
        } else if (info.role === 'navigation') {
            template = getTemplate("navigation.ejs");
        } else {
            template = getTemplate("spec.ejs");
        }

        // формируем объект для передачи в итоговый шаблон спеки
        var templateJSON = {
            content : data,
            header  : headerFooterHTML.header,
            footer  : headerFooterHTML.footer,
            title   : info.title ? info.title : "New spec",
            author  : info.author ? info.author : "Anonymous",
            keywords: info.keywords ? info.keywords : ""
        };

        // рендерим страницу и записываем в реквест
        req.specData.renderedHtml = ejs.render(template, templateJSON);
    }

    // переходим в следующий middleware
    next();
};