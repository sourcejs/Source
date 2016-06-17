'use strict';

var ejs = require('ejs');
var fs = require('fs');
var nodeUtil = require('util');
var glob = require('glob');
var path = require('path');
var _ = require('lodash');
var processMd = require(path.join(global.pathToApp,'core/lib/processMd'));

var originalRenderer = ejs.render;

var EJS_OPTS = ['cache', 'filename', 'sandbox', 'delimiter', 'scope', 'context', 'debug', 'compileDebug', 'client', '_with', 'rmWhitespace'
];

/**
 * Copy properties in data object that are recognized as options to an
 * options object.
 *
 * This is used for compatibility with earlier versions of EJS and Express.js.
 *
 * @memberof module:ejs-internal
 * @param {Object}  data data object
 * @param {Object} opts options object
 * @static
 */

var cpOptsInData = function (data, opts) {
    EJS_OPTS.forEach(function (p) {
        if (typeof data[p] !== 'undefined') {
            opts[p] = data[p];
        }
    });
};

var isRestrictedReadPath = function(pathToRead, options) {
  var isRescricted = true;
  var i;

  if (nodeUtil.isArray(options.sandbox)) {
    for (i = 0; i < options.sandbox.length; i++) {
      var sandboxPpath = options.sandbox[i];
      var notRestricted = path.relative(sandboxPpath, pathToRead).substring(0, 2) !== '..';

      if (notRestricted) {
        isRescricted = false;
        break;
      }
    }

    return isRescricted;
  } else {
    return path.relative(options.sandbox, pathToRead).substring(0, 2) === '..';
  }
};

var readFile = function (filePath, options) {
    if (options.sandbox && isRestrictedReadPath(filePath, options)) {
        throw new Error('reading files beyond sandbox is restricted, limit set to ' + options.sandbox);
    }

    return fs.readFileSync(filePath, 'utf-8');
};

var includeMD = function(data, options){
    return function(mdPath){
        if (!mdPath) return '';

        var origionalFilename = options.filename;

        if (!origionalFilename) throw new Error('`includeMD` requires the \'filename\' option.');

        var fileToInclude = path.extname(mdPath) === '.md' ? mdPath : mdPath + '.md';
        var filePath = path.join(path.dirname(origionalFilename), fileToInclude);
        var fileContents = readFile(filePath, options);

        options.filename = filePath;

        var processedContents = ejs.render(fileContents, data, options);
        var html = processMd(processedContents);

        // Reset filename options on return
        options.filename = origionalFilename;

        return ejs.render(html, data, options);
    };
};

var includeFiles = function(data, options){
    return function(pattern){
        if (!pattern) return '';

        var filename = options.filename;
        var output = '';

        if (!filename) throw new Error('`includeFiles` requires the \'filename\' option.');

        var filesToInclude = glob.sync(pattern, {
            cwd: path.dirname(filename),
            root: global.pathToApp,
            realpath: true
        });

        filesToInclude.forEach(function(filePath){
            _.assign(options, {
                filename: filePath
            });

            output += ejs.render(readFile(filePath, options), data, options);
        });

        // Reset filename options on return
        _.assign(options, {
            filename: filename
        });

        return output;
    };
};

ejs.render = function(template, data, options){
    var sandboxPaths = [
        global.pathToApp,
        global.userPath
    ];

    data = data || {};
    options = options || {};

    // No options object -- if there are optiony names
    // in the data, copy them to options
    if (arguments.length === 2) {
        cpOptsInData(data, options);
    }

    _.assign(data, {
        includeMD: includeMD(data, options),
        includeFiles: includeFiles(data, options)
    });

    if (global.opts.core.sandboxIncludes) {
        _.assign(options, {
            sandbox: sandboxPaths
        });
    }

    return originalRenderer(template, data, options);
};

// Export modified EJS
module.exports = ejs;
