define(["source/load-options"], function(options) {

    'use strict';

    function Css (url) {
        this.url = url;

        this.load();
    }

    Css.prototype.load = function(){
		var href = this.url;

		var link = document.createElement("link");

        link.type = "text/css";
        link.rel = "stylesheet";
		link.href = href;

        document.getElementsByTagName("head")[0].appendChild(link);
    };

    return Css;
});