var path = require('path');
var fs = require('fs-extra');
var async = require('async');
var phantom = require('phantomjs');
var unflatten = require('./unflat');
var childProcess = require('child_process');
var logger = require(path.join(global.pathToApp,'core/logger'));
var log = logger.log;

var config = {
    errorLimit: 2,
    asyncPhantomCallLimit: 5,
    pathToSpecs: '../data/pages_tree.json'
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
            cats: ['base'],
            forceTags: ['lego']
        },
        filterOut: {
            tags: ['html','lego-hide']
        }
    }, true);


    // Preparing data for specs iteration
    specs = specs.map(function(item){
        return item.url.substring(1);
    });

    return specs;
};

var processSpecs = function(specs){
    var specsLeft = specs.slice(0);
    var ph_path = phantom.path;
    var html = {};
    var errorCounter = {};
    var specLength = specs.length;
    var doneCounter = 0;
    var phExecCommand = ph_path + " " + path.join(global.pathToApp, 'core/api/htmlParser/ph_modules/index.js');

    apiLog.trace('Processing ' + specLength + ' specs.')

    async.mapLimit(specs, config.asyncPhantomCallLimit, function (spec, next) {
        var n = specs.indexOf(spec) + 1;

        apiLog.trace('Starts...' + n, spec);

        function callback() {
            apiLog.debug('All specs were processed.')
        }

        childProcess.exec(phExecCommand + " " + spec, function (error, stdout, stderr) {
            handler(error, stdout, stderr, spec, n, callback);
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
            html[spec+'/specFile/contents'] = JSON.parse(stdout);
        }

        apiLog.debug((doneCounter/specLength*100).toFixed(2),'%...Done', spec);

        // Logging specs queen
        specsLeft.splice(specsLeft.indexOf(spec), 1);
        if (specsLeft.length < 5 && specsLeft.length !== 0) {
            apiLog.trace('Specs queen', specsLeft);
        }

        doneCounter++;

        if (doneCounter == specLength) {
            var unflatten_html;
            var JSONformat = null;

            if (global.MODE === 'development') {
                JSONformat = 4;
            }

            unflatten_html =  unflatten(html, { delimiter: '/', overwrite: 'root' });

            //TODO: Dmitry, add more data fields according to hmtl-stub.json
            fs.writeFile(path.join(global.pathToApp, global.opts.core.api.htmlData), JSON.stringify(unflatten_html, null, JSONformat), function (err) {
                if (err) throw err;

                apiLog.info('API successfully updated.');

                // After all specs were both written in file and saved in memory.
                if (typeof callback === 'function') callback();
            });
        }
    }
};

processSpecs(getSpecsList());