'use strict';

var forever = require('tinyforever');
var path = require('path');
var utils = require(path.join(global.pathToApp, 'core/lib/utils'));

var config = {
    enabled: true,
    forever: {
        silent: false,
        max: 10,
        minUptime: 1000,
        args: ['--log='+global.commander.log, '--root=../../']
    }
};
// Overwriting base options
utils.extendOptions(config, global.opts.core.watch);

if (config.enabled) {
    var child = new (forever.Monitor)(path.join(global.pathToApp, 'core/watch/childWatch.js'), config.forever);

    child.on('start', function() {
        global.log.debug('Specs watcher process started with forever.');
    });

    child.on('stderr', function() {
        global.log.warn('Specs watcher error:');
    });

    child.on('restart', function() {
        global.log.debug('Restarting the Specs watcher process...');
    });

    child.on('exit', function () {
        global.log.error('Specs watcher stopped. Re-run app to activate navigation watcher.');
    });

    child.start();

    process.on('exit', function () {
        child.stop();
    });
}