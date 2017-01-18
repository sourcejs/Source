/*!
* SourceJS - Front-end documentation engine
* @copyright 2013-2015 Sourcejs.com
* @license MIT license: http://github.com/sourcejs/sourcejs/wiki/MIT-License
* */

sourcejs.amd.require([
    "jquery",
    "source/load-options", // TODO: remove when all modules inherit Module()
    "sourceModules/browser",
    "sourceModules/moduleLoader",
    'sourceModules/auth'
    ], function ($, options, browser, Loader, Auth) {
        if (options && options.modulesEnabled && options.modulesEnabled.auth === true) {
            new Auth({
                target: $('.js-hook.source_login')
            });
        }
});
