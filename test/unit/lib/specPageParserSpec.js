var path = require('path');
var cheerio = require('cheerio');
var expect = require('chai').expect;

var pathToMasterApp = path.resolve('./');

var loadOptions = require(path.join(pathToMasterApp, 'core/loadOptions'));
global.opts = loadOptions(path.resolve(pathToMasterApp));
var specsParser = require(path.join(pathToMasterApp, 'core/lib/specPageParser'));
var request = require(path.join(pathToMasterApp, 'core/lib/request'));

describe('specsParser.getCssLinksHTML', function () {
    it('it should parse all css links html', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getCssLinksHTML($);

                expect(result).to.be.an('array');
                expect(result[0]).to.equal('<link href="/docs/data/bootstrap-head.css" rel="stylesheet">');
                expect(result[1]).to.equal('<link href="/docs/data/bootstrap-body.css" rel="stylesheet">');

                done();
            }
        });
    });
    it('it should parse css links only from head', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getCssLinksHTML($, 'head');

                expect(result).to.be.an('array');
                expect(result.length).to.equal(1);
                expect(result[0]).to.equal('<link href="/docs/data/bootstrap-head.css" rel="stylesheet">');

                done();
            }
        });
    });
    it('it should parse css links only from head', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getCssLinksHTML($, 'body');

                expect(result).to.be.an('array');
                expect(result.length).to.equal(1);
                expect(result[0]).to.equal('<link href="/docs/data/bootstrap-body.css" rel="stylesheet">');

                done();
            }
        });
    });
});

describe('specsParser.getScriptsHTML', function () {
    it('it should parse all scripts in html', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getScriptsHTML($);

                expect(result).to.be.an('array');
                expect(result[0]).to.equal('<script src="script-in-head.js"></script>');
                expect(result[1]).to.equal('<script src="script-in-body.js"></script>');

                done();
            }
        });
    });
    it('it should parse scriptsonly from head', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getScriptsHTML($, 'head');

                expect(result).to.be.an('array');
                expect(result.length).to.equal(1);
                expect(result[0]).to.equal('<script src="script-in-head.js"></script>');

                done();
            }
        });
    });
    it('it should parse scripts only from head', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getScriptsHTML($, 'body');

                expect(result).to.be.an('array');
                expect(result.length).to.equal(1);
                expect(result[0]).to.equal('<script src="script-in-body.js"></script>');

                done();
            }
        });
    });
});

describe('specsParser.getStyleContainersHTML', function () {
    it('it should parse all style containers html', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getStyleContainersHTML($);

                expect(result).to.be.an('array');
                expect(result[0]).to.equal('<style>.head{color:red}</style>');
                expect(result[1]).to.equal('<style>.body{color:red}</style>');

                done();
            }
        });
    });
    it('it should parse styles only from head', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getStyleContainersHTML($, 'head');

                expect(result).to.be.an('array');
                expect(result.length).to.equal(1);
                expect(result[0]).to.equal('<style>.head{color:red}</style>');

                done();
            }
        });
    });
    it('it should parse styles only from head', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getStyleContainersHTML($, 'body');

                expect(result).to.be.an('array');
                expect(result.length).to.equal(1);
                expect(result[0]).to.equal('<style>.body{color:red}</style>');

                done();
            }
        });
    });
});

describe('specsParser.getSpecResources', function () {
    it('it should parse all resources', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getSpecResources($);

                expect(result).to.be.an('object');
                expect(result.cssLinks).to.be.an('array');
                expect(result.scripts).to.be.an('array');
                expect(result.cssStyles).to.be.an('array');

                expect(result.cssLinks.length).to.equal(2);
                expect(result.scripts.length).to.equal(2);
                expect(result.cssStyles.length).to.equal(2);

                done();
            }
        });
    });
    it('it should parse all resources from head', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getSpecResources($, 'head');

                expect(result).to.be.an('object');
                expect(result.cssLinks).to.be.an('array');
                expect(result.scripts).to.be.an('array');
                expect(result.cssStyles).to.be.an('array');

                expect(result.cssLinks.length).to.equal(1);
                expect(result.scripts.length).to.equal(1);
                expect(result.cssStyles.length).to.equal(1);

                done();
            }
        });
    });
    it('it should parse all resources from body', function (done) {
        request({
            path: '/test/partials/specs/many-assets/',
            internal: true,
            callback: function (response) {
                var $ = cheerio.load(response, {decodeEntities: false});
                var result = specsParser.getSpecResources($, 'head');

                expect(result).to.be.an('object');
                expect(result.cssLinks).to.be.an('array');
                expect(result.scripts).to.be.an('array');
                expect(result.cssStyles).to.be.an('array');

                expect(result.cssLinks.length).to.equal(1);
                expect(result.scripts.length).to.equal(1);
                expect(result.cssStyles.length).to.equal(1);

                done();
            }
        });
    });
});

describe('specsParser.process', function () {
    it('it should return proper object structure', function (done) {
        var result = specsParser.process('');

        expect(result).to.be.an('object');
            expect(result.headResources).to.be.an('object');
                expect(result.headResources.cssLinks).to.be.an('array');
                expect(result.headResources.cssStyles).to.be.an('array');
                expect(result.headResources.scripts).to.be.an('array');

            expect(result.bodyResources).to.be.an('object');
                expect(result.bodyResources.cssLinks).to.be.an('array');
                expect(result.bodyResources.cssStyles).to.be.an('array');
                expect(result.bodyResources.scripts).to.be.an('array');

        expect(result.contents).to.be.an('array');

        done();
    });

    it('it should return parsed spec object', function (done) {
        request({
            path: '/test/partials/specs/simple/',
            internal: true,
            callback: function (response) {
                var result = specsParser.process(response);

                expect(result.contents).to.deep.equal([{
                    nested: [],
                    html: [
                        'HTML example'
                    ],
                    id: '1',
                    visualID: '1',
                    header: 'Section header'
                }]);

                done();
            }
        });
    });

    it('it should return parsed spec object with few examples', function (done) {
        request({
            path: '/test/partials/specs/few-examples/',
            internal: true,
            callback: function (response) {
                var result = specsParser.process(response);

                expect(result.contents).to.deep.equal([{
                    nested: [],
                    html: [
                        'HTML example 1',
                        'HTML example 2'
                    ],
                    id: '1',
                    visualID: '1',
                    header: 'Section header'
                }]);

                done();
            }
        });
    });

    it('it should properly parse nested IDs', function (done) {
        request({
            path: '/test/partials/specs/nested/',
            internal: true,
            callback: function (response) {
                var result = specsParser.process(response);

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
            path: '/test/partials/specs/complex/',
            internal: true,
            callback: function (response) {
                var result = specsParser.process(response);

                expect(result.contents[0].nested[0].id).to.equal('custom-sub-id');

                expect(result.contents[1].id).to.equal('custom-section');

                expect(result.contents[1].nested[0].nested[0].id).to.equal('custom-h4');

                done();
            }
        });
    });

    it('it should properly pass multiple HTML examples', function (done) {
        request({
            path: '/test/partials/specs/complex/',
            internal: true,
            callback: function (response) {
                var result = specsParser.process(response);

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
            path: '/test/partials/specs/nested/',
            internal: true,
            callback: function (response) {
                var result = specsParser.process(response);

                expect(result).to.deep.equal({
                    "headResources": {
                        "cssLinks": [
                            "<link href=\"/docs/data/bootstrap.css\" rel=\"stylesheet\">"
                        ],
                        "cssStyles": [],
                        "scripts": []
                    },
                    bodyResources: {
                        "cssLinks": [],
                        "cssStyles": [],
                        "scripts": []
                    },
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

describe('specsParser.getBySection', function () {
    it('it should properly get by single section', function (done) {
        request({
            path: '/test/partials/specs/nested/',
            internal: true,
            callback: function (response) {
                var result = specsParser.process(response);
                var assertOption = function (sections) {
                    var endResult = specsParser.getBySection(result, sections);

                    expect(result).to.be.an('object');

                    expect(result.headResources).to.be.an('object');
                    expect(result.headResources.cssLinks).to.be.an('array');
                    expect(result.headResources.cssStyles).to.be.an('array');
                    expect(result.headResources.scripts).to.be.an('array');

                    expect(result.bodyResources).to.be.an('object');
                    expect(result.bodyResources.cssLinks).to.be.an('array');
                    expect(result.bodyResources.cssStyles).to.be.an('array');
                    expect(result.bodyResources.scripts).to.be.an('array');

                    expect(endResult.contents.length).to.equal(1);
                    expect(endResult.contents[0].id).to.equal(sections[0]);
                };

                assertOption(['1']);
                assertOption(['custom-sub-id']);
                assertOption(['1.1.1']);

                done();
            }
        });
    });
});
