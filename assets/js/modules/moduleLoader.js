'use strict';

var $ = require('jquery');
var primeModule = require('./module.js');

function ModuleLoader() {
    this.loadModules('modules');
    // this.loadModules('plugins');
    // this.loadModules('npmPlugins');
}

ModuleLoader.prototype = primeModule.createInstance();
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
        path = './';
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
                    require([path + item + '.js']);
                }
            }
        }
    }
};

module.exports = new ModuleLoader();