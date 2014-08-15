var util = require('util');

exports.process = function (req, res, next) {
    if (req.renderedHtml) {
        var html = req.renderedHtml;

        /* some manipulations */
        var smileTpl = "<img src='/source/assets/i/smiles/%s.png' alt='%s' />";

        html = html.replace(":)", util.format(smileTpl, "1f600", ":)"));
        html = html.replace(":D", util.format(smileTpl, "1f602", ":D"));
        html = html.replace(":|", util.format(smileTpl, "1f610", ":|"));
        html = html.replace(":(", util.format(smileTpl, "1f615", ":("));
        html = html.replace(":0", util.format(smileTpl, "1f627", ":0"));

        req.renderedHtml = html;
    }

    next();
};