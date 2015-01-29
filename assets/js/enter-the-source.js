/*!
* SourceJS - Front-end documentation engine
* @copyright 2013-2015 Sourcejs.com
* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
* */
SourceJS.require([
	"jquery",
	"source/load-options"
], function($, globalOpts) {
	"use strict";

	$.each([{
		'type': 'modules',
		'path': 'sourceModules/',
		'enabledType': 'modulesEnabled'
	}, {
		'type': 'plugins',
		'path': 'plugins',
		'enabledType': 'pluginsEnabled'

	}, {
		'type': 'npmPlugins',
		'path': '',
		'enabledType': 'npmPluginsEnabled'

	}], function(index, initializer) {
		var path;
        var typeEnabled;
        var optionsBase = globalOpts;

        // Override options with exceptions
        if ($('meta[name=source-page-role]').attr('content') === 'navigation') {
            optionsBase = globalOpts.navPageModulesBuild;
        }

        if (typeof optionsBase[initializer.enabledType] !== 'undefined') {
            for(var item in optionsBase[initializer.enabledType]) {
                if (optionsBase[initializer.enabledType].hasOwnProperty(item)) {
                    var targetObj = optionsBase[initializer.enabledType][item];
                    if (targetObj) {
                        SourceJS.require([initializer.path + item]);
                    }
                }
            }
        }
	});
	
});
