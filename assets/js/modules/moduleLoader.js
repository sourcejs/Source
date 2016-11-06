sourcejs.amd.define([
    'jquery',
    'sourceModules/module'
    ], function ($, module) {

    'use strict';

    function ModuleLoader() {
        var _this = this;

        this.loadModules('modules');
        this.loadModules('plugins');

        // Extending RequireJS config with npm packages list
        sourcejs.amd.requirejs.config({
            // Create shorthands routes to clint-side npm plugins
            packages: (function () {
                var modulesList = _this.options.npmPluginsEnabled;

                var npmPackages = [];
                for (var module in modulesList) {
                    if (modulesList.hasOwnProperty(module)) {
                        npmPackages.push({
                            name: module,
                            location: '/node_modules/' + module + '/assets',
                            main: 'index'
                        });
                    }
                }

                return npmPackages;
            }())
        });

        this.loadModules('npmPlugins');
    }

    /* наследуем от Module */
    ModuleLoader.prototype = module.createInstance();
    ModuleLoader.prototype.constructor = ModuleLoader;

    ModuleLoader.prototype.loadModules = function(type){
        var path;
        var typeEnabled;
        var optionsBase = this.options;

        // Override options with exceptions
        var isNav = $('meta[name=source-page-role]').attr('content') === 'navigation';
        if (isNav) {
            optionsBase = this.options.navPageModulesBuild;
        }

        if (type === 'modules') {
            typeEnabled = 'modulesEnabled';
            path = 'sourceModules/';
        } else if (type === 'plugins') {
            typeEnabled = 'pluginsEnabled';
            path = 'plugins/';
        } else if (type === 'npmPlugins') {
            typeEnabled = 'npmPluginsEnabled';
            path = '';
        } else {
            console.log('Invalid loadModules argument');

            return;
        }

        if (typeof optionsBase[typeEnabled] !== 'undefined'){
            for(var item in optionsBase[typeEnabled]) {
                if (optionsBase[typeEnabled].hasOwnProperty(item)) {
                    var targetObj = optionsBase[typeEnabled][item];

                    if (targetObj){
                        sourcejs.amd.require([path + item]);

                        if (type === 'plugins') {
                            console.warn('Deprecation notice: module loader will stop supporting local plugins with next breaking release, please move `' + path + item + '` plugin to NPM dependencies, following SourceJS plugin structure https://sourcejs.com/docs/api/plugins.');
                        }
                    }
                }
            }
        }
    };

    return new ModuleLoader();
});
