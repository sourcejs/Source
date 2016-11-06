var should = require('should');
var assert = require('assert');
var path = require('path');

var pathToMasterApp = path.resolve('./');
var utils = require(path.join(pathToMasterApp, 'core/lib/utils'));

describe('utils: extendOptions', function () {
    it('it should extend objects skipping arrays merge', function (done) {
        var input = {
            a: {
                foo: "bar"
            },
            b: ['foo', 'bar']
        };

        utils.extendOptions(input, {
            a: {
                bar: "foo"
            },
            b: ['bar'],
            c: 'val'
        });

        input.should.have.property('c', 'val');

        input.a.should.have.property('foo', 'bar');
        input.a.should.have.property('bar', 'foo');

        input.should.have.property('b').with.lengthOf(1);
        input.should.have.property('b', ['bar']);

        done();
    });

    it('it should accept multiple objects', function (done) {
        var input = {};

        utils.extendOptions(input, {a: 'val', arr: ['foo', 'bar', 'foo']}, {'b': 'val'}, {c: 'val', arr: ['bar', 'foo']});

        input.should.have.property('a', 'val');
        input.should.have.property('b', 'val');
        input.should.have.property('c', 'val');
        input.should.have.property('arr', ['bar', 'foo']);

        done();
    });
});
