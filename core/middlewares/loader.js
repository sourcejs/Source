'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var appRoot = path.resolve('./');
var utils = require(path.join(appRoot, 'core/lib/utils'));
var log = require(path.join(appRoot, 'core/logger')).log;

var gatherMiddlewares = function(dest, filterRegExp, mainJS){
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
                        order: 0,
                        group: 'default',
                        process: require(pluginIndexPath).process
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
                                        log.warn('Middlewares are restricted to define order with value lower than 0 (zero). Please modify '+ middlewareName+ ' middleware options.');
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

var sortMiddlewares = function(groupsOrder, list){
    var output = [];

    if (!_.isArray(groupsOrder) && !list) return output;

    var groupedList = {};

    // Sort by groups
    _.forOwn(list, function (value, key) {
        var group = value.group || 'default';
        var middleware = value;

        middleware.name = middleware.name || key;

        groupedList[group] = groupedList[group] || [];
        groupedList[group].push(value);
    });

    // Sort each group
    _.forOwn(groupedList, function (value, key) {
        groupedList[key] = _.sortByOrder(value, ['order'], ['asc']);
    });

    // Concat groups by order
    groupsOrder.forEach(function(item){
        output = output.concat(groupedList[item]);
    });

    return output;
};

var loadMiddlewares = function(listArr, app){
    if (!_.isArray(listArr) && !app) return;

    log.debug('loading', listArr);

    listArr.forEach(function(item){
        if (typeof item.process === 'function') {
            app.use(item.process);
        }
    });
};

module.exports.process = function(app, globalOptions){
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
                order: -1,
                group: 'pre-html',
                process: require(path.join(appRoot, 'core/middlewares/md')).process
            },
            mdTag: {
                order: 0,
                group: 'html',
                process: require(path.join(appRoot, 'core/middlewares/mdTag')).process
            },
            clarify: {
                order: -2,
                group: 'request',
                process: require(path.join(appRoot, 'core/middlewares/clarify'))
            },
            read: {
                order: -1,
                group: 'request',
                process: require(path.join(appRoot, 'core/middlewares/read')).process
            },
            send: {
                order: -1,
                group: 'response',
                process: require(path.join(appRoot, 'core/middlewares/send')).process
            },
            wrap: {
                order: -1,
                group: 'html',
                process: require(path.join(appRoot, 'core/middlewares/wrap')).process
            }
        }
    };
    utils.extendOptions(
        config,
        {
            list: gatherMiddlewares(path.join(app.get('user'), 'node_modules'), new RegExp(/^sourcejs-/), 'core/middleware/index.js')
        },
        globalOptions.core.middlewares
    );

    loadMiddlewares(sortMiddlewares(config.loadGroupsOrder, config.list), app);
};