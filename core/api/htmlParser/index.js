var path = require('path');
var fs = require('fs-extra');
var async = require('async');
var phantom = require('phantomjs');
var unflatten = require('./unflat');
var deepExtend = require('deep-extend');
var childProcess = require('child_process');
var logger = require(path.join(global.pathToApp,'core/logger'));
var log = logger.log;

var flagNotExec = true;

var config = {
    enabled: true,
    cron: false,
    cronProd: true,
    errorLimit: 2,
    cronRepeatTime: 600000,
    asyncPhantomCallLimit: 5,
    pathToSpecs: path.join(global.pathToApp, global.opts.core.api.specsData)
};
// Overwriting base options
if (global.opts.core.htmlParser) deepExtend(config, global.opts.core.htmlParser);

// Logs config
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

var writeDataFile = function(data, extend, callback){
    var JSONformat = null;

    if (global.MODE === 'development') {
        JSONformat = 4;
    }

    if (extend) {
        //TODO: add queen, for waiting till previos processing stops working before we update with extend

        try {
            var prevData = fs.readJsonFileSync(path.join(global.pathToApp, global.opts.core.api.htmlData));
            data = deepExtend(prevData, data);
        } catch (e) {
            apiLog.warn('writeDataFile extend failed: ', e);
        }
    }

    //TODO: Dmitry, add more data fields according to hmtl-stub.json
    fs.writeFile(path.join(global.pathToApp, global.opts.core.api.htmlData), JSON.stringify(data, null, JSONformat), function (err) {
        if (err) throw err;

        apiLog.debug('htmlParser data been written.');

        // After all specs were both written in file and saved in memory.
        if (typeof callback === 'function') callback();
    });
};

var processSpecs = function(specs){
    if (flagNotExec) {
        var specsLeft = specs.slice(0);
        var ph_path = phantom.path;
        var outputHTML = {};
        var errorCounter = {};
        var specLength = specs.length;
        var doneCounter = 0;
        var phExecCommand = ph_path + " " + path.join(global.pathToApp, 'core/api/htmlParser/ph_modules/index.js');

        flagNotExec = false;

        apiLog.trace('Processing ' + specLength + ' specs.')

        async.mapLimit(specs, config.asyncPhantomCallLimit, function (spec, next) {
            var n = specs.indexOf(spec) + 1;
            var callback = function() {
                apiLog.info('HTML API successfully updated.')
                flagNotExec = true;
            };

            apiLog.trace('Starts...' + n, spec);

            childProcess.exec(phExecCommand + " " + spec, function (error, stdout, stderr) {
                handler(error, stdout, stderr, spec, callback);
                next();
            });
        });

        var handler = function(error, stdout, stderr, spec, callback) {
        if (error) {
            if (typeof errorCounter[spec] !== 'number') {
                 errorCounter[spec] = 0;
            }

            errorCounter[spec]++;

            // If limit is not reached, try again
            if (errorCounter[spec] <= config.errorLimit) {
                apiLog.debug('Rerun', spec);

                childProcess.exec(phExecCommand + " " + spec, function (error, stdout, stderr) {
                    handler(error, stdout, stderr, spec, callback);
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
            writeDataFile(outputData, false, callback);
        }
    }
    }
};

// Running processSpecs by cron
if (config.enabled && (config.cron || (global.MODE === 'production' && config.cronProd))) {
    setInterval(function () {
        processSpecs(getSpecsList());
    }, config.cronRepeatTime);
}

module.exports = {
    processSpecs: function (specsList) {
        var _specsList = specsList || getSpecsList();

        processSpecs(_specsList);
    },

    writeDataFile: function(data, extend, callback) {
        writeDataFile(data, extend, callback);
    }
};