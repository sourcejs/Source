'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var appRoot = global.pathToApp;
var utils = require(path.join(appRoot, 'core/lib/utils'));
var log = require(path.join(appRoot, 'core/logger')).log;

var gatherMiddlewares = function (dest, filterRegExp, mainJS) {
    var output = {};

    if (fs.existsSync(dest)) {
        var userMiddlewareFiles = fs.readdirSync(dest);

        userMiddlewareFiles.map(function (dir) {
            if (!filterRegExp || filterRegExp.test(dir)) {
                var middlewareName = dir;
                var _mainJS = mainJS || 'index.js';

                var pluginIndexPath = path.join(dest, dir, _mainJS);
                if (fs.existsSync(pluginIndexPath)) {
                    output[middlewareName] = {
                        enabled: true,
                        order: 0,
                        group: 'default',
                        indexPath: pluginIndexPath
                    };

                    // Load middleware options
                    var configPath = path.join(dest, dir, 'options.js');
                    if (fs.existsSync(configPath)) {
                        var middlewareConfig = require(configPath);

                        _.forOwn(output[middlewareName], function (value, key) {
                            var overVal = middlewareConfig[key];

                            if (overVal) {
                                if (key === 'order') {
                                    if (overVal >= 0) {
                                        output[middlewareName][key] = overVal;
                                    } else {
                                        log.warn('Middlewares are restricted to define order with value lower than 0 (zero). Please modify ' + middlewareName + ' middleware options.');
                                    }
                                } else {
                                    output[middlewareName][key] = overVal;
                                }
                            }
                        });
                    }
                }
            }
        });
    }

    return output;
};

var sortMiddlewares = function (groupsOrder, list) {
    var output = [];

    if (!(groupsOrder && _.isArray(groupsOrder) && list)) return output;

    var groupedList = {};

    // Sort by groups
    _.forOwn(list, function (value, key) {
        var group = value.group || 'default';
        var middleware = value;

        if (!middleware.enabled) return;

        middleware.name = middleware.name || key;

        groupedList[group] = groupedList[group] || [];
        groupedList[group].push(value);
    });

    // Sort each group
    _.forOwn(groupedList, function (value, key) {
        groupedList[key] = _.orderBy(value, ['order'], ['asc']);
    });

    // Concat groups by order
    groupsOrder.forEach(function (item) {
        if (groupedList[item]) output = output.concat(groupedList[item]);
    });

    return output;
};

var loadMiddlewares = function (listArr, app) {
    if (!_.isArray(listArr) && !app) return;

    listArr.forEach(function (item) {
        if (item && item.indexPath && fs.existsSync(item.indexPath)) {
            log.debug('require middleware', item.indexPath);
            app.use(require(item.indexPath).process);
        }
    });
};

module.exports.process = function (app, globalOptions) {
    var config = {
        loadGroupsOrder: [
            'request',
            'pre-html',
            'default',
            'html',
            'response'
        ],
        list: {
            md: {
                enabled: true,
                order: -1,
                group: 'pre-html',
                indexPath: path.join(appRoot, 'core/middlewares/md.js')
            },
            preRenderEjs: {
                enabled: true,
                order: -2,
                group: 'pre-html',
                indexPath: path.join(appRoot, 'core/middlewares/preRenderEjs.js')
            },
            breadcrumb: {
                enabled: true,
                order: -2,
                group: 'pre-html',
                indexPath: path.join(appRoot, 'core/middlewares/breadcrumb.js')
            },
            mdTag: {
                enabled: true,
                order: 0,
                group: 'html',
                indexPath: path.join(appRoot, 'core/middlewares/mdTag.js')
            },
            clarify: {
                enabled: true,
                order: -2,
                group: 'request',
                indexPath: path.join(appRoot, 'core/middlewares/clarify.js')
            },
            read: {
                enabled: true,
                order: -1,
                group: 'request',
                indexPath: path.join(appRoot, 'core/middlewares/read.js')
            },
            send: {
                enabled: true,
                order: -1,
                group: 'response',
                indexPath: path.join(appRoot, 'core/middlewares/send.js')
            },
            wrap: {
                enabled: true,
                order: -1,
                group: 'html',
                indexPath: path.join(appRoot, 'core/middlewares/wrap.js')
            }
        }
    };
    utils.extendOptions(
        config,
        {
            list: gatherMiddlewares(path.join(global.userPath, 'node_modules'), new RegExp(/^sourcejs-/), 'core/middleware/index.js')
        },
        globalOptions.core.middlewares
    );

    loadMiddlewares(sortMiddlewares(config.loadGroupsOrder, config.list), app);
};
