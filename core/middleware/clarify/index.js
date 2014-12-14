'use strict';

var path = require('path');
var fs = require('fs-extra');
var url = require('url');
var Q = require('q');
var jsdom = require('jsdom');
var ejs = require('ejs');
var specUtils = require(path.join(global.pathToApp, 'core/specUtils'));
var parseData = require(path.join(global.pathToApp, 'core/api/parseData'));
var pathToApp = path.dirname(require.main.filename);

var htmlDataPath = path.join(pathToApp, global.opts.core.api.htmlData);
var parseHTMLData = new parseData({
    scope: 'html',
    path: htmlDataPath
});

//TODO JSdoc

var getTpl = function(tpl) {
    var deferred = Q.defer();

    var templateName = tpl ? tpl : 'default';
    var pathToTemplate = path.join(global.pathToApp, 'core/views/clarify', templateName + '.ejs');
    var userPathToTemplate = path.join(global.app.get('user'), 'core/views/clarify', templateName + '.ejs');

    // First we check user tempalte, then core
    fs.readFile(userPathToTemplate, 'utf-8', function(err, data){
        if (err) {

            fs.readFile(pathToTemplate, 'utf-8', function(err, data){
                if (err) {
                    deferred.reject(err);
                    return;
                }

                deferred.resolve(data);
            });
            return;
        }

        deferred.resolve(data);
    });

    return deferred.promise;
};

var parseSpec = function(sections, pathToSpec) {
    var deferred = Q.defer();

    // Parsing spec with JSdom
    jsdom.env(
        'http://127.0.0.1:' + global.opts.core.common.port + pathToSpec,
        ['http://127.0.0.1:' + global.opts.core.common.port + '/source/assets/js/modules/sectionsParser.js'],
        function (err, window) {
            if (err) {
                deferred.reject(err);
                return;
            }

            var SourceGetSections = window.SourceGetSections;

            var output = {};
            var parser = new SourceGetSections();

            output.contents = parser.getContents(sections);
            output.headResources = parser.getHeadResources();

            deferred.resolve(output);
        }
    );

    return deferred.promise;
};

var getDataFromApi = function(sections, pathToSpec) {
    var deferred = Q.defer();

    //TODO: Move spec ID check to utils
    var specID = pathToSpec.slice(1, pathToSpec.length - 1);
    var specHTML = parseHTMLData.getBySection(specID, sections);

    deferred.resolve(specHTML);

    return deferred.promise;
};

module.exports = function(req, res, next) {
	var parsedUrl = url.parse(req.url, true);

    // Query params
    var q = parsedUrl.query;
    var clarifyFlag = q.clarify;

    // Check if middleware needs to be activated
	if (clarifyFlag) {
        var urlPath = parsedUrl.pathname;
        var parsedPath = specUtils.parseSpecPath(urlPath);

        var tpl = q.tpl;
        var fromApi = q.fromApi || false;
        var turnOnJS = q.js || true;
        var sections = q.sections ? q.sections.split(',') : undefined;

        var specInfo = specUtils.getSpecInfo(parsedPath.pathToSpec);

        var getSpecData = function(){
            return fromApi ? getDataFromApi(sections, parsedPath.pathToSpec) : parseSpec(sections, parsedPath.pathToSpec);
        };

        getSpecData().then(function(specData){
            var checkHeadResources = function(specData, target){
                return specData.headResources && specData.headResources[target]
            };

            var templateJSON = {
                turnOnJS: turnOnJS,
                title: specInfo.title,
                sections: specData.contents ? specData.contents : [],
                cssLinks: checkHeadResources(specData, 'cssLinks') ? specData.headResources.cssLinks.join('\n') : '',
                scriptLinks: checkHeadResources(specData, 'scriptLinks') ? specData.headResources.scriptLinks.join('\n'): '',
                cssStyles: checkHeadResources(specData, 'cssStyles') ? specData.headResources.cssStyles : ''
            };

            getTpl(tpl).then(function(tpl){
                var html = '';

                try {
                    html = ejs.render(tpl, templateJSON);
                } catch (err) {
                    var msg = 'ERROR: EJS rendering failed';
                    global.log.error(msg + ': ', err);

                    html = msg;
                }

                res.send(html);
            }).fail(function(err) {
                var msg = 'ERROR: Could not find requested or default template for Clarify';

                global.log.warn(msg + ': ', err);

                res.status(500).send(msg);
            });
        }).fail(function(err) {
            global.log('Clarify: Could not render parse Spec.', err);

            res.status(500).send('Could not render parse Spec.');
        });
	} else {
        // redirect to next express middleware
        next();
    }
};