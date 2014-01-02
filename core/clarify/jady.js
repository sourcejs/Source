var jade = require('jade');

module.exports  = function (locals, tpl) {
	return jade.renderFile('core/clarify/jade/'+ tpl +'.jade', locals, function (err, html) {
		if (err) console.log('Jade reports: ' + err);

		return html;
	});
};
