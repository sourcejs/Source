'use strict';

var path = require('path');
var fs = require('fs-extra');

var extendTillSpec = require(path.join(global.pathToApp,'core/lib/extendTillSpec'));
var logger = require(path.join(global.pathToApp,'core/logger'));
var utils = require(path.join(global.pathToApp,'core/lib/utils'));
var flattenTillSpec = require(path.join(global.pathToApp,'core/lib/flattenTillSpec'));

var config = {};

// Overwriting base options
if (global.opts.core.htmlTree) utils.extendOptions(config, global.opts.core.htmlTree);

// Custom API logging config
var apiLog = (function(){
    logger.prepareLogDir('log/api');
    logger.addAppenders([
        {
            "type": "clustered",
            "appenders": [
                {
                    "type": "file",
                    "filename": path.join(global.pathToApp, 'log/api/api.log')
                },
                {
                    "type": "logLevelFilter",
                    "level": "ERROR",
                    "appender": {
                        "type": "file",
                        "filename": path.join(global.pathToApp, 'log/api/errors.log')
                    }
                },
                {
                    "type": "logLevelFilter",
                    "level": "DEBUG",
                    "appender": {
                        "type": "file",
                        "filename": path.join(global.pathToApp, 'log/api/debug.log')
                    }
                }
            ],
            category: 'api'
        }
    ]);

    return logger.log4js.getLogger('api');
})();

/**
 * Remove all objects from data, that has lower priority (doesn't have forcedSave flag)
 *
 * @param {Object} prevData - data to check more priority specs from
 * @param {Object} data - data that will be merged onto prevData and will be processed with this func
 *
 * @returns {Object} Returns processed data, with removed low-priority specs
 */
var excludeLowOverridings = function(prevData, data) {
    var checkObj = flattenTillSpec(prevData);

    var processData = function(obj, currentNesting){
        Object.keys(obj).forEach(function(key){
            var nesting = currentNesting ? currentNesting + '/' + key : key;

            if (obj[key].toString() === '[object Object]') {

                if (!obj[key].specFile) {
                    // Go deeper
                    obj[key] = processData(obj[key], nesting);
                } else {
                    // Check prevData on force flag
                    var checkHigherPrioritySpec = !!(checkObj[nesting] && checkObj[nesting].forcedSave);

                    if (checkHigherPrioritySpec && !obj[key].specFile.forcedSave) {
                        // Delete low priority override
                        delete obj[key];
                    }
                }
            }
        });

        return obj;
    };

    return processData(data);
};

/**
 * Write gathered HTML data to file system
 *
 * @param {Object} data - data object with specs list, that will be stringified and written to FS
 * @param {Boolean} [extend] - set true, to merge incoming data object with last written data
 * @param {String} [dataPath] - custom data storage path
 *
 * @param {Function} [callback] - callback function on file write
 * @param {Object} callback.err - Passes error if it exists
 * @param {Object} callback.outputData - Passes output data to callback
 */
var writeDataFile = module.exports.writeDataFile = function(data, extend, dataPath, callback) {
    if (data) {
        var dataStoragePath = dataPath || path.join(global.pathToApp, global.opts.core.api.htmlData);

        var JSONformat = null;

        if (global.MODE === 'development') JSONformat = 4;

        if (extend) {
            //TODO: add queen, for waiting till previous processing stops working before we update with extend

            var prevData = {};

            try {
                prevData = fs.readJsonSync(dataStoragePath);
            } catch (e) {
                apiLog.trace('Reading initial data error: ', e);
                apiLog.debug('Extending from empty object, as we do not have initial data');
            }

            // Exclude from data all low-priority overridings
            data = excludeLowOverridings(prevData, data);

            // Extend final data
            data = extendTillSpec(prevData, data);
        }

        // Preparing path for data write
        try {
            fs.mkdirpSync(path.dirname(dataStoragePath));
        } catch (e) {
            if (e.code !== 'EEXIST') {
                apiLog.warn("Could not set up HTML data directory, error: ", e);

                if (typeof callback === 'function') callback('ERROR: error creating data directory', null);
            }
        }

        fs.writeFile(dataStoragePath, JSON.stringify(data, null, JSONformat), function (err) {
            if (err) {
                var message = 'ERROR: updated file write error';

                apiLog.warn('HTML data write fail, write file error', err);

                if (global.MODE === 'development') message = message + ': ' + err;

                if (typeof callback === 'function') callback(message, null);
            } else {
                apiLog.debug('parseHTML data been written.');

                // After all specs were both written in file and saved in memory.
                if (typeof callback === 'function') callback(null, data);
            }
        });
    } else {
        apiLog.warn('HTML data write fail, no data provided for writeDataFile');
        if (typeof callback === 'function') callback('ERROR: no data provided', null);
    }
};

/**
 * Delete object from HTML data storage
 *
 * @param {String} dataPath - path to data object
 * @param {String} removeID - object ID for removal
 * @param {Function} [callback] - callback function on file write
 */
module.exports.deleteFromDataFile = function(dataPath, removeID, callback) {
    if (removeID) {
        var data;
        var pathSplit = removeID.split('/');

        try {
            data = fs.readJsonSync(dataPath);
        } catch (e) {}

        if (data) {
            var processPath = function(pathArr, obj){
                var pathArrQueue = pathArr.slice(0); // Arr copy
                var currentItem = pathArrQueue.shift();

                if (currentItem !== '' && obj[currentItem]) {
                    if (pathArrQueue.length === 0) {
                        delete obj[currentItem];
                    }

                    if (pathArrQueue.length !== 0 && obj[currentItem].toString() === '[object Object]') {
                        obj[currentItem] = processPath(pathArrQueue, obj[currentItem]);
                    }
                }

                return obj;
            };

            var processedData = processPath(pathSplit, data);

            writeDataFile(processedData, false, dataPath, function(err, finalData){
                if (err || !finalData) {
                    if (typeof callback === 'function') callback(err, null);
                } else {
                    if (typeof callback === 'function') callback(null, finalData);
                }
            });
        } else {
            var errorMsg = 'No initial HTML data to delete from';

            apiLog.warn(errorMsg);
            if (typeof callback === 'function') callback(errorMsg, null);
        }
    } else {
        if (typeof callback === 'function') callback('No ID provided', null);
    }
};
