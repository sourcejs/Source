var url = require('url');
var path = require('path');
var macaddress = require('macaddress');
var ua = require('universal-analytics');
var log = require(path.join(global.pathToApp, 'core/logger')).log;
var crypto = require('crypto');

var generateMachineID = function(){
    var macNums = macaddress.networkInterfaces();
    var unique = '';
    var macItem;

    for (macItem in macNums) {
        var val = macNums[macItem];

        if (val.mac) {
            unique += val.mac;
        } else if (val.ipv4) {
            unique += val.ipv4;
        }
    }

    return 'host_' + crypto.createHash('md5').update(unique).digest('hex').slice(0, 5);
};

var staticVisitor = ua('UA-66924051-1', generateMachineID(), {strictCidFormat: false});

// Track page visits by unique session ID
var trackPage = function(opts){
    if (!global.opts.core.common.trackAnonymusStatistics) return;

    var visitor = ua('UA-66924051-1', opts.sessionID, {strictCidFormat: false});

    log.trace('track page', opts.pageName);

    visitor.pageview(opts.pageName).send();
};

// Track host-initiated events (by unique machine id)
var staticEvent = function(group, event, force){
    if (!force && !global.opts.core.common.trackAnonymusStatistics) return;

    log.trace('track event', group, event);

    staticVisitor.event(group, event).send();
};

module.exports.specs = function(req) {
    var pageName = 'spec';
    var sessionID = req.sessionID;

    var parsedUrl = url.parse(req.url, true);
    var q = parsedUrl.query || {};

    if (q.internal) return;

    if (req.originalPath === '/') {
        pageName = '/';
    } else if (req.specData && req.specData.info && req.specData.info.role === 'navigation') {
        pageName = 'navigation';
    }

    trackPage({
        sessionID: sessionID,
        pageName: pageName
    });
};

module.exports.page = function(pageName, sessionID) {
    trackPage({
        sessionID: sessionID,
        pageName: pageName
    });
};

module.exports.staticEvent = staticEvent;