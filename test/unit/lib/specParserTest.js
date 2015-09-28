var path = require('path');
var expect = require('chai').expect;

var pathToMasterApp = path.resolve('./');

var loadOptions = require(path.join(pathToMasterApp, 'core/loadOptions'));
global.opts = loadOptions(path.resolve(pathToMasterApp));
var specsParser = require(path.join(pathToMasterApp, 'core/lib/specsParser'));
var request = require(path.join(pathToMasterApp, 'core/lib/request'));

describe('specsParser', function () {
    it('it should return proper object structure', function (done) {
        var result = specsParser('');

        expect(result).to.be.an('object');
        expect(result.headResources).to.be.an('object');
        expect(result.bodyResources).to.be.an('object');
        expect(result.contents).to.be.an('array');

        done();
    });

    it('it should return parsed spec object', function (done) {
        request({
            path: '/test/unit/partials/specs/simple/',
            internal: true,
            callback: function (response) {
                var result = specsParser(response);

                expect(result).to.deep.equal({
                    headResources: {},
                    bodyResources: {},
                    contents: [{
                        nested: [],
                        html: [
                            'HTML example'
                        ],
                        id: '1',
                        visualID: '1',
                        header: 'Section header'
                    }]
                });

                done();
            }
        });
    });

    it('it should return parsed spec object with few examples', function (done) {
        request({
            path: '/test/unit/partials/specs/few-examples/',
            internal: true,
            callback: function (response) {
                var result = specsParser(response);

                expect(result).to.deep.equal({
                    headResources: {},
                    bodyResources: {},
                    contents: [{
                        nested: [],
                        html: [
                            'HTML example 1',
                            'HTML example 2'
                        ],
                        id: '1',
                        visualID: '1',
                        header: 'Section header'
                    }]
                });

                done();
            }
        });
    });

    it('it should properly parse nested IDs', function (done) {
        request({
            path: '/test/unit/partials/specs/nested/',
            internal: true,
            callback: function (response) {
                var result = specsParser(response);

                expect(result.contents[0].visualID).to.equal('1');
                expect(result.contents[0].nested[0].visualID).to.equal('1.1');
                expect(result.contents[0].nested[1].visualID).to.equal('1.2');
                expect(result.contents[0].nested[0].nested[0].visualID).to.equal('1.1.1');

                expect(result.contents[0].id).to.equal('1');
                expect(result.contents[0].nested[0].id).to.equal('custom-sub-id');
                expect(result.contents[0].nested[1].id).to.equal('1.2');
                expect(result.contents[0].nested[0].nested[0].id).to.equal('1.1.1');

                done();
            }
        });
    });

    it('it should properly parse multiple custom ID\'s', function (done) {
        request({
            path: '/test/unit/partials/specs/complex/',
            internal: true,
            callback: function (response) {
                var result = specsParser(response);

                expect(result.contents[0].nested[0].id).to.equal('custom-sub-id');

                expect(result.contents[1].id).to.equal('custom-section');

                expect(result.contents[1].nested[0].nested[0].id).to.equal('custom-h4');

                done();
            }
        });
    });

    it('it should properly pass multiple HTML examples', function (done) {
        request({
            path: '/test/unit/partials/specs/complex/',
            internal: true,
            callback: function (response) {
                var result = specsParser(response);

                expect(result.contents[0].html[0]).to.equal('HTML example 1');
                expect(result.contents[1].nested[0].html[0]).to.equal('HTML example 1.1');
                expect(result.contents[1].nested[0].nested[0].html[0]).to.equal('HTML example 1.1.1');
                expect(result.contents[1].nested[0].nested[0].html[1]).to.equal('HTML example 1.1.1');

                expect(result.contents[1].nested[1].html[0]).to.equal('HTML example 1.2');

                done();
            }
        });
    });

    it('it should return full nested spec object', function (done) {
        request({
            path: '/test/unit/partials/specs/nested/',
            internal: true,
            callback: function (response) {
                var result = specsParser(response);

                expect(result).to.deep.equal({
                    headResources: {},
                    bodyResources: {},
                    contents: [{
                        html: [
                            'HTML example 1'
                        ],
                        id: '1',
                        visualID: '1',
                        header: 'Section header',
                        nested: [{
                            nested: [{
                                nested: [],
                                html: [
                                    'HTML example 1.1.1'
                                ],
                                id: '1.1.1',
                                visualID: '1.1.1',
                                header: 'Section sub-sub-header'
                            }],
                            html: [
                                'HTML example 1.1'
                            ],
                            id: 'custom-sub-id',
                            visualID: '1.1',
                            header: 'Section sub-header'
                        },
                        {
                            nested: [],
                            html: [
                                'HTML example 1.2'
                            ],
                            id: '1.2',
                            visualID: '1.2',
                            header: 'Section sub-header'
                        }]
                    }]
                });

                done();
            }
        });
    });
});