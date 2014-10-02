'use strict';

// modules
var fs = require('fs');
var url = require('url');

module.exports = function reply(req, res, next) {

    function prepareHTML(clientHTMLObj, sectionsID, tpl) {

        var clientHTML = "";

        for (var i = 0; i < sectionsID.length; i++) {
            var id = sectionsID[i];

            if (clientHTMLObj[id]) {
                clientHTML += clientHTMLObj[id];
            } else {
                clientHTML += "<div>id:"+id+" This section does not exist!</div>";
            }
        }

        var placeHolder = "<%clarifyBody%>";
        if (tpl !== undefined) {
            try {

                try {
                    tpl = fs.readFileSync("./user/core/clarify/tpl/"+tpl+".html", "utf8");
                } catch (e) {
                    tpl = fs.readFileSync(__dirname+"/tpl/"+tpl+".html", "utf8");
                }

                var start = tpl.indexOf(placeHolder);
                var end = start+placeHolder.length;

                var startStr = tpl.substr(0,start);
                var endStr = tpl.substr(end);

                clientHTML = startStr + clientHTML + endStr;

            } catch (e) {
                var fileList = fs.readdirSync(__dirname+"/tpl/").join(", ").replace(/.html/g, '');
                clientHTML = "<div style='color: red;'>Template: "+tpl+" does not exist</div>" +
                    "<div>There are: "+fileList+"</div>";
            }
        }

        return clientHTML;
    }

	var parsedUrl = url.parse(req.url, true),
		urlPath = parsedUrl.pathname;

	if (req.url.indexOf("?clarify")>-1) {
        var sectionsID = parsedUrl.query.id.split(",");
        var tpl = parsedUrl.query.tpl;

        var pathStr = urlPath.substr(1,urlPath.length-2);
        var pathArr = pathStr.split("/");
        var htmlJSON = require("../../html.json");

        var i;
        for (i = 0; i < pathArr.length; i++) {
            var path = pathArr[i];
            htmlJSON = htmlJSON[path];
        }

        var sections = htmlJSON.specFile.contents;
        var clientHTMLObj = {};

        for (i = 0; i < sections.length; i++) {
            var sec = sections[i];
            if (sectionsID.indexOf(sec.id.toString())>-1) {
                clientHTMLObj[sec.id] = sec.html;
            }
        }

        res.end(prepareHTML(clientHTMLObj, sectionsID, tpl));

	} else next();
};
