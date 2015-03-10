module.exports = (function() {
	'use strict';

    var TasksQueue = function(options) {
        this.threadsNumber = options && options.threads ? options.threads : 1;
        this.threadQueues = [];
        this.ptr = 0;
        for (var i = 0; i < this.threadsNumber; i++) {
            this.threadQueues.push([]);
        }
    };

    TasksQueue.prototype.push = function(task) {
        this.threadQueues[this.getQueueNumber()].push(task);
    };

    TasksQueue.prototype.getQueueNumber = function() {
        this.ptr++;
        if (this.ptr >= this.threadsNumber) {
            this.ptr = 0;
        }
        return this.ptr;
    };

    TasksQueue.processTasksSync = function(tasks, callback) {
        if (!tasks || !tasks.length) {
            callback && callback();
            return;
        }
        tasks.shift()(function() {
            TasksQueue.processTasksSync(tasks, callback);
        });
    };

    TasksQueue.prototype.execute = function(callback) {
        var remaining = this.threadQueues.length;
        this.threadQueues.forEach(function(queue) {
            TasksQueue.processTasksSync(queue, function() {
                if (!--remaining) {
                    callback && callback();
                }
            });
        });
    };

    return TasksQueue;
})();