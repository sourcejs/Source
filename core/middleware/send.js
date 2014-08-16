/*
* Если в реквесте есть отрендеренный html, отправляем его вкачестве респонса.
* Этим самым замыкаем цепочку обработчиков контента спеки.
*
* @param {object} req - Request object
* @param {object} res - Response object
* @param {function} next - The callback function
* */
exports.process = function (req, res, next) {
    if (req.specData && req.specData.renderedHtml) {
        res.send(req.specData.renderedHtml);
    } else {
        next();
    }
};