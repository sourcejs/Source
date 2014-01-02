// All data collection methods

module.exports = {

	// collect data from <head>
	getHeadData: function (doc) {

		var
			headTag = doc.head,
			links = headTag.getElementsByTagName('link'),
			linksArr = [],
			scripts = headTag.getElementsByTagName('script'),
			scriptsArr = [],
			styleTag = headTag.getElementsByTagName('style')[0],
			styleTagHtml = (styleTag)? styleTag.outerHTML : "";

		// stylesheets
		var i = 0;
		while(i < links.length) {
			var el = links[i];

			if(el.rel == 'stylesheet' || el.type == 'text/css') linksArr.push(el.outerHTML);
			++i;
		}

		// scripts
		var i = 0;
		while(i < scripts.length) {
			var el = scripts[i];

			if( el.dataset && el.dataset['nonclarify'] ) {
				++i;
				continue;
			}
			scriptsArr.push(el.outerHTML);
			++i;
		}

		if(styleTag) linksArr.push(styleTagHtml);
		return [linksArr.join('\n'), scriptsArr.join('\n')];
	},

	// .source_examples code
	getSource: function (doc, id, wrap) {
		var
			sources = doc.getElementsByClassName('source_example'),
			idArr = JSON.parse('['+ id +']'),
			html = '',
            wrap = (wrap === true || wrap === 'true')? true : false;

		idArr.forEach( function (el, i, arr) { arr.splice(i, 1, --el) } );

		var i = 0;
		while(i < idArr.length) {
            if (wrap) html += (sources[idArr[i]].outerHTML);
            else html += (sources[idArr[i]].innerHTML);
			++i;
		}

		return {
			"content": html,
			"length": sources.length,
			"id": id,
			"idSum": idArr.length
		}
	},

	// collect meta-data
	getMeta: function (doc) {
		var
			author = doc.getElementsByName('author')[0],
			keywords = doc.getElementsByName('keywords')[0],
			description = doc.getElementsByName('description')[0];

		return {
			"author": (author)? author.content : "",
			"keywords": (keywords)? keywords.content : "",
			"description": (description)? description.content : ""
		}
	}

}
