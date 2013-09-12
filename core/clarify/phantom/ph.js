var page = require('webpage').create(),
	system = require('system');

// arguments from node query
var url = system.args[1],
	id = system.args[2];

page.open(url);

page.onLoadFinished = function (msg) {
	if (msg != 'success') console.log('Сервер не отвечает.');
	else {

        //TODO: create and check callback from templater
        setTimeout(function(){
            var code = page.evaluate(function (id) {
            var html = {};

            // collect style tag data and links to styles
            function getHeadData() {
                var
                    headTag = document.head,
                    links = headTag.getElementsByTagName('link'),
                    linksArr = [],
					scripts = headTag.getElementsByTagName('script'),
					scriptsArr = [],
                    styleTag = headTag.getElementsByTagName('style')[0],
                    styleTagHtml = (styleTag)? styleTag.outerHTML : "";

				// links to styles
                var i = 0;
                while(i < links.length) {
                    var el = links[i];

                    if(el.rel == 'stylesheet' || el.type == 'text/css') linksArr.push(el.outerHTML);
                    ++i;
                }

				// head scripts
				var i = 0;
				while(i < scripts.length) {
					var el = scripts[i];

					if(!el.getAttribute('data-requiremodule') && !el.getAttribute('data-main')) scriptsArr.push(el.outerHTML);
					++i;
				}

                if(styleTag) linksArr.push(styleTagHtml);
                return [linksArr.join('\n'), scriptsArr.join('\n')];
            }


            // collect source_example code
            function getSource(id) {
                var
                    sources = document.getElementsByClassName('source_example'),
                    idArr = JSON.parse('['+ id +']'),
                    html = '';

                idArr.forEach(function (el, i, arr) { arr.splice(i, 1, --el) });

                var i = 0;
                while(i < idArr.length) {
                    html += (sources[idArr[i]].outerHTML);
                    ++i;
                }

                return {
                    "content": html,
                    "length": sources.length,
                    "id": id,
                    "idSum": idArr.length
                }
            }

            // collect meta-data
            function getMeta() {
                var doc = window.document,
                    author = doc.getElementsByName('author')[0],
                    keywords = doc.getElementsByName('keywords')[0],
                    description = doc.getElementsByName('description')[0];

                return {
                    "author": (author)? author.content : "",
                    "keywords": (keywords)? keywords.content : "",
                    "description": (description)? description.content : ""
                }
            }

            try {
                html.meta = getMeta();
                html.title = document.title;
                html.styles = getHeadData()[0];
                html.scripts = getHeadData()[1];
                html.source = getSource(id);
            } catch (e) {
                if(e) html.err = e.name + '\nWrong request. May be block you looking for dont\'t exist or has an you confuse .';
            }

            return html;
        }, id);

        console.log(JSON.stringify(code, null, 1));
        }, 250)
	}

    setTimeout(function(){
		phantom.exit();
    }, 250)
};

// error handler & logger: helps to avoid error stream within a common log
page.onError = function(msg, trace) {};
