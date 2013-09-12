var
	fs = require('fs'),
	url = require('url'),
	path = require('path'),
	exec = require('child_process').exec,
	jady = require('./jady');

var
	opts = require('../options'),
	publicPath = opts.common.pathToSpecs;


module.exports = function reply(req, res, next) {
	var
		parsedUrl = url.parse(req.url, true),
		urlPath = parsedUrl.pathname,
		urlHost = req.headers.host,
		urlAdress = (parsedUrl.protocol || "") + urlHost + urlPath;

	// if we have query on index.html
	if (path.basename(parsedUrl.path).indexOf('index.html') != -1 && parsedUrl.query.get) {
		fs.readFile(publicPath + '/' + urlPath, function (err, data) {
			if (err) res.end('Huston, we have 404.\n'+ err);

			// executes ph.js via phantomjs
			var id = parsedUrl.query.id,
				params = "sudo core/clarify/phantomjs core/clarify/phantom/ph.js " +
						 "http://" + urlAdress + " " + id;

			var child = exec(params, function (err, stdout, stderr) {
				if (err) console.log('Exec error: ' + err);
				else {
					try {
						var html = JSON.parse(stdout);
						console.log(html);
					} catch(e) {
						html = 'Parsing error: ' + e;
						console.log(html);
					}

					if (html.source) {
						// переменные для Jade
						var locals = {
							head: {
								title: html.title,
								mAuthor: html.meta.author,
								mKeywords: html.meta.keywords,
								mDescription: html.meta.description,
								scripts: html.scripts,
								stylesheets: html.styles
							},
							body: {
								spec: html.source.content,
								specLength: html.source.length,
								specId: html.source.id,
								specIdSum: html.source.idSum,
								homeLink: 'http://'+ urlAdress
							},
							pretty: true
						};
						res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
						res.end(jady(locals));
					} else {
						res.end('STDOUT: can\'t recieve content.');
					}
				}
			});

		});
	} else next();
};



// TODO: check list below
// [done] сделать красивый вывод html
// [done] разобрать и создать json для заполнения header
// [done] парсинг нескольких спек сразу
// * [parital support] переключатели на други спеки, если запрошенная не одна, иконки для get-запроса со большой спеки
// * [] phantomjs -> jsdom
// * [] Лёха: универсальный шаблонизатор для страниц контекста
// * [] убрать захардкоженные пути
// * [] сделать вывод полностью чистой спеки без любых элементов ОКП
// * [] подключать css/js опционально по запросу в URI
// * [] GET -> POST
// * [] Ajax
// * [] Кнопки подключения библиотек (jQuery, require);
// * [] ссылка с блока в clarify на оригинальный блок в спеке
// * [] "чистые" шаблоны для других контекстов (все стилевые контексты моба, веб, ...)
// * [] ошибка phantomjs при попытке загрузить недоступный script
// * [] скриншоты спек со страницы
// * [] phantomjs: не закрывать сессию (?);
