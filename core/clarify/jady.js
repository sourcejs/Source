var jade = require('jade');

module.exports  = function (locals) {
	return jade.renderFile('core/clarify/jade/mob.jade', locals, function (err, html) {
		if (err) console.log('Jade reports: ' + err);

		return html;
	});
};
