// All data collection methods

'use strict';

module.exports = {

	// collect data from <head>
	getHeadData: function (doc) {

		var headTag = doc.head;
		var links = headTag.getElementsByTagName('link');
		var linksArr = [];
		var scripts = headTag.getElementsByTagName('script');
		var scriptsArr = [];
		var styleTag = headTag.getElementsByTagName('style')[0];
		var styleTagHtml = (styleTag)? styleTag.outerHTML : "";

		// stylesheets
		var i = 0;
		var el;
		while(i < links.length) {
			el = links[i];

			if(el.rel === 'stylesheet' || el.type === 'text/css') linksArr.push(el.outerHTML);
			++i;
		}

		// scripts
		i = 0;
		while(i < scripts.length) {
			el = scripts[i];

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
		var sources = doc.getElementsByClassName('source_example');
		var idArr = JSON.parse('['+ id +']');
		var html = '';
		wrap = (wrap === true || wrap === 'true')? true : false;

		idArr.forEach( function (el, i, arr) { arr.splice(i, 1, --el); } );

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
		};
	},

	// collect meta-data
	getMeta: function (doc) {
		var author = doc.getElementsByName('author')[0];
		var keywords = doc.getElementsByName('keywords')[0];
		var description = doc.getElementsByName('description')[0];

		return {
			"author": (author)? author.content : "",
			"keywords": (keywords)? keywords.content : "",
			"description": (description)? description.content : ""
		};
	}

};
