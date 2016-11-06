var path = require('path');

var pathToMasterApp = path.resolve('./');

var should = require('should');
var request = require('supertest');

var cheerio = require('cheerio');

var loadOptions = require(path.join(pathToMasterApp, 'core/loadOptions'));
global.opts = loadOptions(path.resolve(pathToMasterApp));


describe('Clarify test /docs/test-specs/styles/?clarify=true', function () {
    describe('GET /docs/test-specs/styles/?clarify=true...', function () {
        var url = 'http://127.0.0.1:8080/docs/test-specs/styles/?clarify=true';
        it('should return nothing (&sections=77)', function (done) {
            request(url)
                .get('&sections=77')
                .expect(500)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    var $ = cheerio.load(res.text, {decodeEntities: false});
                    var examples = $('.source_example');

                    examples.length.should.equal(0);
                    done();
                });
        });

        it('should return all sections', function (done) {
            request(url)
                .get('')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    var $ = cheerio.load(res.text, {decodeEntities: false});
                    var sectionHeaders = $('.source_section_h');
                    var examples = $('.source_example');

                    sectionHeaders.length.should.be.greaterThan(1);
                    examples.length.should.be.greaterThan(0);

                    done();
                });
        });

        it('should return one example', function (done) {
            request(url)
                .get('&sections=1.1')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    var $ = cheerio.load(res.text, {decodeEntities: false});

                    var examples = $('.source_example');
                    var headers = $('.source_section_h');

                    examples.length.should.equal(1);
                    headers.length.should.equal(1);

                    done();
                });
        });

        it('should have injected resources', function (done) {
            request(url)
                .get('&sections=1.1')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    var $ = cheerio.load(res.text, {decodeEntities: false});
                    $('[href*="bootstrap.css"]').length.should.greaterThan(0);
                    $('body > style').length.should.be.greaterThan(0);
                    $('body > script').length.should.be.greaterThan(0);

                    done();
                });
        });

        it('should change template', function (done) {
            request(url)
                .get('&tpl=clear')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    var $ = cheerio.load(res.text, {decodeEntities: false});

                    var examples = $('.source_example');

                    $('.__clear').length.should.equal(1);
                    examples.length.should.equal(0);

                    done();
                });
        });

        it('should disable javascript', function (done) {
            request(url)
                .get('&nojs=true')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    var $ = cheerio.load(res.text, {decodeEntities: false});

                    var scripts = $('body script');

                    // Only clarify script should remain
                    scripts.length.should.be.equal(1);

                    done();
                });
        });
    });

    describe('GET from API /docs/test-specs/styles?clarify=true&fromApi=true...', function () {
        var urlFromApi = 'http://localhost:8080/docs/test-specs/styles/?clarify=true&fromApi=true';

        it('should return nothing (&sections=77&apiUpdate=true)', function (done) {
            this.timeout(10000);
            request(urlFromApi)
                .get('&sections=77&apiUpdate=true')
                .expect(500)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    var $ = cheerio.load(res.text, {decodeEntities: false});
                    var examples = $('.source_example');
                    examples.length.should.equal(0);
                    done();
                });
        });
    });
});
