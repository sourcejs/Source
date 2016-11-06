var should = require('should');
var assert = require('assert');
var path = require('path');

var pathToMasterApp = path.resolve('./');
var extendTillSpec = require(path.join(pathToMasterApp, 'core/lib/extendTillSpec'));

var target = {
    base: {
        btn: {
            specFile: {
                some: [
                        'a',
                        'b',
                        'c'
                ]
            }
        },
        test: 'bgg'
    },
    project: 'some'
};

var src = {
    base: {
        btn: {
            specFile: {
                some: [
                        'a'
                ]
            }
        }
    }
};

target = extendTillSpec(target, src);

describe('extendTillSpec module check', function () {
    it('should overwrite all in specFile', function (done) {
        var length = target.base.btn.specFile.some.length;

        length.should.equal(1);

        done();
    });

    it('should extend everything till specFile', function (done) {

        target.project.should.be.type('string');
        target.base.test.should.be.type('string');

        done();
    });
});
