define(["core/options"], function(options) {
    function Css (url,path) {
        this.url = url;
        this.plainPath = path;

        this.path = this.plainPath || options.pluginsDir;
        this.npmPath = options.npmPluginsDir;

        this.load();
    }

    Css.prototype.load = function(){
		var href = this.path + this.url;

		//Migrating to new plugins directory
		if (typeof this.plainPath === 'undefined' && (/^sourcejs-/).test(this.url) ) {
			href = this.npmPath + this.url;
		}

		var link = document.createElement("link");

        link.type = "text/css";
        link.rel = "stylesheet";
		link.href = href;

        document.getElementsByTagName("head")[0].appendChild(link);
    };

    return Css;
});