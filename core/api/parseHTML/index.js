var path = require('path');
var fs = require('fs-extra');
var async = require('async');
var phantom = require('phantomjs');
var unflatten = require(path.join(global.pathToApp,'core/unflat'));
var deepExtend = require('deep-extend');
var childProcess = require('child_process');
var logger = require(path.join(global.pathToApp,'core/logger'));
var log = logger.log;

var flagNotExec = true;

var config = {
    // Run all specs HTML parser on app start
    onStart: true,
    cron: false,
    cronProd: true,
    cronRepeatTime: 600000,

    // PhantomJS retry limit
    errorLimit: 2,
    asyncPhantomCallLimit: 5,

    // Path to HTML data otput
    pathToSpecs: path.join(global.pathToApp, global.opts.core.api.specsData)
};
// Overwriting base options
if (global.opts.core.parseHTML) deepExtend(config, global.opts.core.parseHTML);

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
 * Get list of specs for parsing with PhantomJS
 *
 * @returns {Array} Returns array with spec URLs
 */
var getSpecsList = function() {
    var parseData = require(path.join(global.pathToApp,'core/api/parseData'));
    var parseSpecs = new parseData({
        scope: 'specs',
        path: require.resolve(config.pathToSpecs)
    });

    var specs = parseSpecs.getFilteredData({
        filter: {
            cats: ['base']
        },
        filterOut: {
            tags: ['parse-problems']
        }
    }, true);

    // Preparing data for specs iteration
    specs = specs.map(function(item){
        return item.url.substring(1);
    });

    return specs;
};

/**
 * Write gathered HTML data to file system
 *
 * @param {Object} data - data object with specs list, that will be stringified and written to FS
 * @param {Boolean} extend - set true, to merge incoming data object with last written data
 * @param {String} dataPath - custom data storage path
 *
 * @param {Function} callback - callback function on file write
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
                prevData = fs.readJsonFileSync(dataStoragePath);
            } catch (e) {
                apiLog.debug('Extending from empty object, as we do not have initial data', e);
            }

            data = deepExtend(prevData, data);
        }

        // Preparing path for data write
        try {
            fs.mkdirpSync(path.dirname(dataStoragePath));
        } catch (e) {
            if (e.code != 'EEXIST') {
                apiLog.warn("Could not set up HTML data directory, error: ", e);

                if (typeof callback === 'function') callback('ERROR: error creating data directory', null);
            }
        }

        //TODO: Dmitry, add more data fields according to hmtl-stub.json
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
 * @param {String} removePath - path to object for removal
 * @param {Function} callback - callback function on file write
 */
module.exports.deleteFromDataFile = function(dataPath, removePath, callback) {
    var data;
    var pathSplit = removePath.split('/');

    try {
        data = fs.readJsonFileSync(dataPath);
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

        console.log('processedData',processedData);


        writeDataFile(processedData, false, dataPath, function(err, finalData){
            if (err || !finalData) {
                if (typeof callback === 'function') callback(err, null);
            } else {
                if (typeof callback === 'function') callback(null, finalData);
            }
        });
    } else {
        var errorMsg = 'No initial HTML data to delete from';

        apiLog.warn(errorMsg, e);
        if (typeof callback === 'function') callback(errorMsg, null);
    }
};

/**
 * PhantomJS async runner, calls writeDataFile on finish
 *
 * @param {Array} specs - array with URL list, that will be passed to PhantomJS
 *
 * @param {Function} callback - callback function
 * @param {Object} callback.outputData - Passes output data to callback
 */
var processSpecs = module.exports.processSpecs = function(specs, callback){
    if (flagNotExec) {
        apiLog.info('HTML API update started')

        var _specs = specs || getSpecsList();
        var specsLeft = _specs.slice(0);
        var ph_path = phantom.path;
        var outputHTML = {};
        var errorCounter = {};
        var specLength = _specs.length;
        var doneCounter = 0;
        var phExecCommand = ph_path + " " + path.join(global.pathToApp, 'core/api/parseHTML/ph_modules/index.js');

        flagNotExec = false;

        apiLog.trace('Processing ' + specLength + ' specs.')

        async.mapLimit(_specs, config.asyncPhantomCallLimit, function (spec, next) {
            var n = _specs.indexOf(spec) + 1;

            // Callback is passed to writeDataFile
            var callbackProxy = function() {
                apiLog.info('HTML API successfully updated')
                flagNotExec = true;
            };

            apiLog.trace('Starts...' + n, spec);

            childProcess.exec(phExecCommand + " " + spec, function (error, stdout, stderr) {
                handler(error, stdout, stderr, spec, callbackProxy);
                next();
            });
        });

        var handler = function(error, stdout, stderr, spec, callbackProxy) {
            if (error) {
                if (typeof errorCounter[spec] !== 'number') {
                     errorCounter[spec] = 0;
                }

                errorCounter[spec]++;

                // If limit is not reached, try again
                if (errorCounter[spec] <= config.errorLimit) {
                    apiLog.debug('Rerun', spec);

                    childProcess.exec(phExecCommand + " " + spec, function (error, stdout, stderr) {
                        handler(error, stdout, stderr, spec, callbackProxy);
                    });
                    return;
                }

                apiLog.error('Exec error on spec ' + spec + ': '+ error);
                apiLog.debug('Error info: ', JSON.stringify({
                    spec: spec,
                    error: error,
                    stdount: stdout,
                    stderr: stderr
                }));
            } else {
                apiLog.debug('Spec done: ', JSON.stringify({
                    spec: spec,
                    error: error,
                    stderr: stderr
                }));

                // Writing contents to common obj
                outputHTML[spec+'/specFile/contents'] = JSON.parse(stdout);
            }

            apiLog.debug((doneCounter/specLength*100).toFixed(2),'%...Done', spec);

            // Logging specs queen
            specsLeft.splice(specsLeft.indexOf(spec), 1);
            if (specsLeft.length < 5 && specsLeft.length !== 0) {
                apiLog.trace('Specs queen', specsLeft);
            }

            doneCounter++;

            if (doneCounter == specLength) {
                var outputData = unflatten(outputHTML, { delimiter: '/', overwrite: 'root' });

                writeDataFile(outputData, false, false, callbackProxy);
                if (typeof callback === 'function') callback(outputData);
            }
        }
    }
};

// Running processSpecs by cron
if (config.onStart && (config.cron || (global.MODE === 'production' && config.cronProd))) {
    setInterval(function () {
        processSpecs();
    }, config.cronRepeatTime);
}