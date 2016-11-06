'use strict';

var http = require('http');
var url = require('url');
var Q = require('q');

module.exports = function(options) {
    var deferred = Q.defer();

    options = options || {};

    if (!options.path) return;

    var reqOptions = {
        host: options.host || '127.0.0.1',
        port: options.port || global.opts.core.server.port,
        path: options.path + (options.internal ? '?internal=true' : '')
    };
    var fullUrl = url.resolve(reqOptions.host + ':' + reqOptions.port, reqOptions.path);

    var reqCallback = function (response) {
        var endResponse = '';

        response.on('data', function (chunk) {
            endResponse += chunk;
        });

        response.on('end', function () {
            if (typeof options.callback === 'function') {
                options.callback(endResponse);
            }

            deferred.resolve(endResponse);
        });
    };

    var request = http.request(reqOptions, reqCallback);

    request.on('error', function (e) {
        deferred.reject({
            msg: 'Failed loading spec ' + fullUrl
        });
    });

    request.end();

    return deferred.promise;
};
