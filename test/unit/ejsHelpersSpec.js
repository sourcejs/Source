var path = require('path');
var expect = require('chai').expect;

var pathToMasterApp = path.resolve('./');

var ejs = require(path.join(pathToMasterApp, 'core/ejsWithHelpers.js'));
var loadOptions = require(path.join(pathToMasterApp, 'core/loadOptions'));
global.opts = loadOptions(path.resolve(pathToMasterApp));

describe('includeMD', function () {
    it('should properly include Markdown file', function (done) {
        var result = ejs.render('<%- includeMD("../partials/markdown") %>', {
            filename: __filename
        });

        expect(result).to.equal('<p>Hello <strong>world</strong>!</p>\n');

        done();
    });

    it('should properly include Markdown file with EJS includes', function (done) {
        var result = ejs.render('<%- includeMD("../partials/markdown-ejs") %>', {
          world: 'world'
        }, {
            filename: __filename
        });

        expect(result).to.equal('<p>Hello <strong>world</strong>!</p>\n');

        done();
    });

    it('should properly include Markdown with nested include', function (done) {
        var result = ejs.render('<%- includeMD("../partials/markdown-ejs-nested") %>', {
          world: 'world'
        }, {
            filename: __filename
        });

        expect(result).to.contain('<p>Nested:</p><p>Hello <strong>world</strong>!</p>');

        done();
    });
});

describe('includeFiles', function () {
    it('should include one file by glob', function (done) {
        var result = ejs.render('<%- includeFiles("../partials/mask-one.html") %>', {
            filename: __filename
        });

        expect(result).to.equal('one<br>');

        done();
    });

    it('should include multiple files by glob', function (done) {
        var result = ejs.render('<%- includeFiles("../partials/mask-*.html") %>', {
            filename: __filename
        });

        expect(result).to.contain('one');
        expect(result).to.contain('two');
        expect(result).to.contain('three');
        expect(result).to.contain('Hello');

        done();
    });
});
