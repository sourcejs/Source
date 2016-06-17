'use strict';

var url = require('url');
var _ = require('lodash');
var path = require('path');
var device = require('device');
var macaddress = require('macaddress');
var ua = require('universal-analytics');
var log = require(path.join(global.pathToApp, 'core/logger')).log;
var utils = require(path.join(global.pathToApp, 'core/lib/utils'));
var crypto = require('crypto');

var config = {
    enabled: true,
    trackingId: 'UA-66924051-2'
};

utils.extendOptions(
    config,
    global.opts.core.tracking
);

if (process.env.CI || (global.commander && global.commander.test)) {
    config.enabled = false;
}

var generateMachineID = function(){
    var macNums = macaddress.networkInterfaces();
    var unique = '';

    _.forOwn(macNums, function(val){
        if (val.mac) {
            unique += val.mac;
        } else if (val.ipv4) {
            unique += val.ipv4;
        }
    });

    return 'host-' + crypto.createHash('md5').update(unique).digest('hex').slice(0, 5);
};

var machineID = generateMachineID();
var hostVisitor = ua(config.trackingId, machineID, {strictCidFormat: false});

var _trackPage = function(opts){
    if (
        !config.enabled ||
        !opts.pageName ||
        (opts.ua && device(opts.ua).is('bot'))
    ) return;

    var visitor = hostVisitor;
    var uid = machineID;

    if (opts.sessionID) {
        uid = opts.sessionID;
        visitor = ua(config.trackingId, uid, {strictCidFormat: false});
    }

    var payload = {
        dp: opts.pageName,
        ds: machineID,
        cs: machineID,
        cid: uid,
        uid: uid
    };

    log.trace('track page', opts.pageName);
    log.trace('as a visitor', visitor);

    if (opts.ua) payload.ua = opts.ua;

    visitor.pageview(payload).send();
};

// Track host-initiated events (by unique machine id)
var _trackEvent = function(opts, force){
    force = process.env.CI ? false : force;

    if (!force && !config.enabled || !opts.event) return;

    var visitor = hostVisitor;
    var uid = machineID;
    var group = opts.group || 'default';

    if (opts.sessionID) {
        uid = opts.sessionID;
        visitor = ua(config.trackingId, uid, {strictCidFormat: false});
    }

    log.trace('track event', group + ':' + opts.event);
    log.trace('as a visitor', visitor);

    visitor.event({
        ec: group,
        ea: opts.event,
        ds: machineID,
        cs: machineID,
        cid: uid,
        uid: uid
    }).send();
};

var getSessionID = module.exports.getSessionID = function(req) {
    var sessionID = req.sessionID;
    var host = req.headers && req.headers.host ? req.headers.host : undefined;

    if (host && (/^localhost/.test(host) || /^127.0.0.1/.test(host))) {
        sessionID = machineID;
    } else if (req.cookies && req.cookies['source-track']) {
        sessionID = req.cookies['source-track'];
    }

    return sessionID;
};

// Track specs
module.exports.specs = function(req) {
    var pageName = 'spec';

    var parsedUrl = url.parse(req.url, true);
    var q = parsedUrl.query || {};
    var ua = req.headers && req.headers['user-agent'] ? req.headers['user-agent'] : undefined;

    if (q.internal) return;

    if (req.path === '/') {
        pageName = '/';
    } else if (req.specData && req.specData.info && req.specData.info.role === 'navigation') {
        pageName = 'navigation';
    }

    _trackPage({
        sessionID: getSessionID(req),
        pageName: pageName,
        ua: ua
    });
};

module.exports.page = _trackPage;
module.exports.event = _trackEvent;
