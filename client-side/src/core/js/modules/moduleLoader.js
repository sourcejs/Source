define(["modules/module"], function (module) {

    function ModuleLoader() {
        this.initModules('module');
        this.initModules('plugin');
    }

    /* наследуем от Module */
    ModuleLoader.prototype = module.createInstance();
    ModuleLoader.prototype.constructor = ModuleLoader;

    ModuleLoader.prototype.initModules = function(type){
        var path, typeEnabled, jsPath;
        if(type === 'module') {
            typeEnabled = 'modulesEnabled';
            path = 'modules/';
        } else {
            typeEnabled = 'pluginsEnabled';
            path = 'plugins/';
        }

        for(var item in this.options[typeEnabled]){
			var targetObj = this.options[typeEnabled][item];

			if (item === 'custom' && Object.prototype.toString.call( targetObj ) ) {
				targetObj.forEach(function(item){
					require([item]);
				});
			} else if (targetObj){
                jsPath = item;

                if(type === 'plugin') {
                    jsPath += '/js/' + item;
                }

                require([path + jsPath]);
            }
        }
    };

    return new ModuleLoader();
});