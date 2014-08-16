var util = require('util');

/*
 * Получаем html из реквеста и заменяем смайлики на соответствующие картинки
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function (req, res, next) {
    if (req.specData.renderedHtml) {
        var html = req.specData.renderedHtml;

        /* some manipulations */
        var smileTpl = "<img src='/source/assets/i/smiles/%s.png' alt='%s' />";

        html = html.replace(":)", util.format(smileTpl, "1f600", ":)"));
        html = html.replace(":D", util.format(smileTpl, "1f602", ":D"));
        html = html.replace(":|", util.format(smileTpl, "1f610", ":|"));
        html = html.replace(":(", util.format(smileTpl, "1f615", ":("));
        html = html.replace(":0", util.format(smileTpl, "1f627", ":0"));

        req.specData.renderedHtml = html;
    }

    next();
};