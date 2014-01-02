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
            if(this.options[typeEnabled][item]){
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