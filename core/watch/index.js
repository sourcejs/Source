'use strict';

var forever = require('tinyforever');
var path = require('path');
var deepExtend = require('deep-extend');

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
deepExtend(config, global.opts.core.watch);

if (config.enabled) {
    var child = new (forever.Monitor)(path.join(global.pathToApp, 'core/watch/childWatch.js'), config.forever);

    child.on('start', function() {
        global.log.info('Specs watcher process started with forever.');
    });

    child.on('stderr', function() {
        global.log.error('Specs watcher error:');
    });

    child.on('restart', function() {
        global.log.warn('Restarting the Specs watcher process...');
    });

    child.on('exit', function () {
        global.log.error('Specs watcher stopped. Re-run app to activate navigation watcher.');
    });

    child.start();

    process.on('exit', function () {
        child.stop();
    });
}