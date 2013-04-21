define(["core/options"], function(options) {
    function css (url,path) {
        this.url = url;
        this.path = path || options.pluginsDir;

        this.load();
    }

    css.prototype.load = function(){
        var link = document.createElement("link");

        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = this.path + this.url;

        document.getElementsByTagName("head")[0].appendChild(link);
    };

    return css;
});