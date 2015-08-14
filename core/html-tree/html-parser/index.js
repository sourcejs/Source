'use strict';

var path = require('path');
var async = require('async');
var ParseData = require(path.join(global.pathToApp,'core/lib/parseData'));
var phantom = require('phantomjs');
var unflatten = require(path.join(global.pathToApp,'core/unflat'));
var childProcess = require('child_process');
var htmlTree = require(path.join(global.pathToApp,'core/html-tree'));
var utils = require(path.join(global.pathToApp,'core/lib/utils'));

var processFlagNotExec = true;

var config = {
    enabled: true,

    // Run HTML parser on app start
    onStart: false,
    cron: false,
    cronProd: true,
    cronRepeatTime: 600000,

    // PhantomJS retry limit
    errorLimit: 2,
    asyncPhantomCallLimit: 5,

    specsFilter: {
        filterOut: {
            cats: ['docs'],
            tags: ['parse-problems']
        }
    },

    // Path to HTML data otput
    pathToSpecs: path.join(global.pathToApp, global.opts.core.api.specsData)
};

// Overwriting base options
if (global.opts.core.parseHTML) utils.extendOptions(config, global.opts.core.parseHTML); // Legacy support
if (global.opts.plugins && global.opts.plugins.htmlParser) utils.extendOptions(config, global.opts.plugins.htmlParser);

/**
 * Get list of specs for parsing with PhantomJS
 *
 * @returns {Array} Returns array with spec URLs
 */
var getSpecsList = function() {
    var parseSpecs = new ParseData({
        scope: 'specs',
        path: require.resolve(config.pathToSpecs)
    });

    var specs = parseSpecs.getFilteredData(config.specsFilter, true);

    // Preparing data for specs iteration
    specs = specs.map(function(item){
        return item.url.substring(1);
    });

    return specs;
};

/**
 * PhantomJS async runner, calls writeDataFile on finish
 *
 * @param {Array} specs - array with URL list, that will be passed to PhantomJS
 *
 * @param {Function} [callback] - callback function
 * @param {Object} callback.err - Error object
 * @param {Object} callback.outputData - Passes output data to callback
 */
var processSpecs = module.exports.processSpecs = function(specs, callback){
    callback = typeof callback === 'function' ? callback : function(){};

    if (!config.enabled) {
        callback('HTML parser disabled.');

        return;
    }

    if (processFlagNotExec) {
        global.log.info('HTML API update started');

        var _specs = specs || getSpecsList();
        var specsLeft = _specs.slice(0);
        var PhantomPath = phantom.path;
        var outputHTML = {};
        var errorCounter = {};
        var specLength = _specs.length;
        var doneCounter = 0;
        var phExecCommand = PhantomPath + " " + path.join(global.pathToApp, 'core/html-tree/html-parser/phantomRunner.js');

        processFlagNotExec = false;

        global.log.trace('Processing ' + specLength + ' specs.');

        async.mapLimit(_specs, config.asyncPhantomCallLimit, function (spec, next) {
            var n = _specs.indexOf(spec) + 1;

            global.log.trace('Starts...' + n, spec);

            childProcess.exec(phExecCommand + " " + spec + " " + global.opts.core.server.port, function (error, stdout, stderr) {
                handler(error, stdout, stderr, spec);
                next();
            });
        });

        var handler = function(error, stdout, stderr, spec) {
            if (error) {
                if (typeof errorCounter[spec] !== 'number') {
                     errorCounter[spec] = 0;
                }

                errorCounter[spec]++;

                // If limit is not reached, try again
                if (errorCounter[spec] <= config.errorLimit) {
                    global.log.debug('Rerun', spec);

                    childProcess.exec(phExecCommand + " " + spec, function (error, stdout, stderr) {
                        handler(error, stdout, stderr, spec, writeCallback);
                    });
                    return;
                }

                global.log.error('Exec error on spec ' + spec + ': '+ error);
                global.log.debug('Error info: ', JSON.stringify({
                    spec: spec,
                    error: error,
                    stdount: stdout,
                    stderr: stderr
                }));
            } else {
                var parsedStdout = [];

                try {
                    parsedStdout = JSON.parse(stdout);
                } catch(e) {
                    global.log.debug('HTML Parser stdout parse error: ', e, stdout);
                    global.log.debug('Error from Phantom parser: ', stdout);
                    parsedStdout = {
                        message: "Stdout parse error"
                    };
                }

                global.log.debug('Spec done: ', JSON.stringify({
                    spec: spec,
                    error: error,
                    stderr: stderr
                }));

                // Writing contents to common obj
                outputHTML[spec+'/specFile/contents'] = parsedStdout.contents;
                outputHTML[spec+'/specFile/headResources'] = parsedStdout.headResources;
                outputHTML[spec+'/specFile/bodyResources'] = parsedStdout.bodyResources;
            }

            global.log.debug((doneCounter/specLength*100).toFixed(2),'%...Done', spec);

            // Logging specs queen
            specsLeft.splice(specsLeft.indexOf(spec), 1);
            if (specsLeft.length < 5 && specsLeft.length !== 0) {
                global.log.trace('Specs queen', specsLeft);
            }

            doneCounter++;

            // We handled all requested specs
            if (doneCounter === specLength) {
                var outputData = unflatten(outputHTML, { delimiter: '/', overwrite: 'root' });

                // Callback is passed to writeDataFile
                var writeCallback = function() {
                    global.log.info('HTML API successfully updated');
                    processFlagNotExec = true;

                    callback(null, outputData);
                };

                htmlTree.writeDataFile(outputData, true, false, writeCallback);
            }
        };
    }
};

if (config.enabled) {
    // Running processSpecs by cron
    if (config.cron || (global.MODE === 'production' && config.cronProd)) {
        setInterval(function () {
            processSpecs();
        }, config.cronRepeatTime);
    }

    if (config.onStart) {
        setTimeout(processSpecs, 100);
    }
}