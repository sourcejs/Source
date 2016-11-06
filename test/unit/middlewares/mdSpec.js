var should = require('should');
var request = require('supertest');
var cheerio = require('cheerio');

describe('Test .md support', function () {
    var url = 'http://127.0.0.1:8080';

    describe('GET /docs/spec-markdown/', function () {
        it('should render h1', function (done) {
            var body = {
            };
            request(url)
                .get('/docs/spec-markdown/')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    var $ = cheerio.load('<div id="content">'+ res.text +'</div>');

                    var hasDom = $('h1').length === 1;

                    hasDom.should.be.ok;

                    done();
                });
        });
    });

    describe('GET /docs/spec-markdown/', function () {
        it('should render sections', function (done) {
            var body = {
            };
            request(url)
                .get('/docs/spec-markdown/')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    var $ = cheerio.load('<div id="content">'+ res.text +'</div>');

                    var hasDom = $('.source_section').length >= 1;
                    var oneHeaderPerSection = true;

                    $('.source_section').each(function(){
                        if ($(this).children('h2').length !== 1) {
                            oneHeaderPerSection = false;
                        }
                    });

                    hasDom.should.be.ok;
                    oneHeaderPerSection.should.be.ok;

                    done();
                });
        });
    });

    describe('GET /docs/spec-markdown/', function () {
        it('should render code', function (done) {
            var body = {
            };
            request(url)
                .get('/docs/spec-markdown/')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    var $ = cheerio.load('<div id="content">'+ res.text +'</div>');

                    var hasDom = $('code.src-html').length >= 1;

                    hasDom.should.be.ok;

                    done();
                });
        });
    });
});
