'use strict';

var path = require('path');
var log4js = require('log4js');
var utils = require('./lib/utils');
var fs = require('fs-extra');

var logRootDir = global.pathToApp || __dirname;
var customLogLevel = global.commander && global.commander.log ? global.commander.log : undefined;
var defaultLogLevel = global.MODE === 'production' ? global.opts.core.common.defaultProdLogLevel : global.opts.core.common.defaultLogLevel;
var logLevel = customLogLevel || defaultLogLevel;

var config =  {
    prepareLogPath: 'log',
    log4js: {
        "appenders": [
            {
                "type": "logLevelFilter",
                "level": logLevel,
                "appender": {
                    "type": "console",
                    "layout": {
                        "type": "pattern",
                        "pattern": "%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] -%] %m"
                    }
                }
            },
            {
                "type": "clustered",
                "appenders": [
                    {
                        "type": "file",
                        "filename": path.join(logRootDir, 'log/app.log'),
                        "maxLogSize": 10485760,
                        "numBackups": 3
                    },
                    {
                        "type": "logLevelFilter",
                        "level": "ERROR",
                        "appender": {
                            "type": "file",
                            "filename": path.join(logRootDir, 'log/errors.log')
                        }
                    },
                    {
                        "type": "logLevelFilter",
                        "level": "WARN",
                        "appender": {
                            "type": "file",
                            "filename": path.join(logRootDir, 'log/warnings.log')
                        }
                    }
                ],
                category: 'app'
            }
        ]
    }
};

if (global.opts.core.logger) utils.extendOptions(config, global.opts.core.logger);

var reloadConf = function(currentConf){
    log4js.configure(currentConf);
    log4js.replaceConsole(log4js.getLogger('app'));
};

var addAppenders = function(appendersArr){

    appendersArr.forEach(function(item){
        config.log4js.appenders.push(item);
    });

    reloadConf(config.log4js);
};

var prepareLogDir = function(dir){
    // Preparing log dir
    try {
        fs.mkdirpSync(path.join(logRootDir, dir));
    } catch (e) {
        if (e.code !== 'EEXIST') {
            console.error("Could not set up log directory, error: ", e);
        }
    }
};

// Prepare dafault log path
prepareLogDir(config.prepareLogPath);

// Configuring log4js
reloadConf(config.log4js);

var logger = log4js.getLogger('app');

// Example
// logger.trace('trace');
// logger.debug('debug');
// logger.info('info');
// console.log('console log');
// logger.warn('warn');
// logger.error('error');
// logger.fatal('fatal');

if (global.logQueue) global.logQueue.forEach(function(item){
    logger[item.level](item.msg);
});

module.exports = {
    addAppenders: addAppenders,
    prepareLogDir: prepareLogDir,

    // Default logger
    log: logger,

    // Configured log4js
    log4js: log4js
};
