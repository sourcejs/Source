var marked = require('marked');

/*
 * Get html from response and parse contained Markdown markup
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
exports.process = function (req, res, next) {
    if (req.specData && req.specData.renderedHtml) {
        var html = req.specData.renderedHtml;

        /* find text wrapped with <markdown> */
        html = html.replace(/<markdown>([\s\S]*?)<\/markdown>/g, function(match) {
            // strip tags
            match = match.replace(/<markdown>|<\/markdown>/g, "");

            // render markdown
            match = marked(match);

            return match;
        });

        req.specData.renderedHtml = html;
    }

    next();
};