'use strict';

sourcejs.amd.define(["source/load-options"], function(options) {
    function Css (url, cat) {
        this.url = url;
        this.cat = cat || 'plugin';

        this.inject();
    }

    Css.prototype.inject = function(){
        var href = this.url;

        var link = document.createElement("link");

        link.type = "text/css";
        link.rel = "stylesheet";
        link.dataset.source = this.cat;
        link.href = href;

        document.getElementsByTagName("head")[0].appendChild(link);
    };

    return Css;
});
