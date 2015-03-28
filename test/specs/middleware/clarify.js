var fs = require('fs');
var path = require('path');

var pathToMasterApp = path.resolve('./');
var jq = fs.readFileSync(path.join(pathToMasterApp,'assets/js/lib/jquery-1.11.1.js'), "utf-8");

var should = require('should');
var assert = require('assert');
var request = require('supertest');
var jsdom = require('jsdom');



describe('Clarify test /docs/spec?clarify=true', function () {
    describe('GET from JSDOM /docs/spec?clarify=true...', function () {
        var url = 'http://localhost:8080/docs/spec/?clarify=true';
        it('should return nothing (&sections=77)', function (done) {
            request(url)
                .get('&sections=77')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    jsdom.env({
                        html: res.text,
                        src: [jq],
                        done: function (errors, window) {
                            var $ = window.$;
                            var examples = $('.source_example');

                            examples.length.should.equal(0);

                            done();
                        }
                    });
                });
        });

        it('should return all sections', function (done) {
            request(url)
                .get()
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    jsdom.env({
                        html: res.text,
                        src: [jq],
                        done: function (errors, window) {
                            var $ = window.$;
                            var sectionHeaders = $('.source_section_h');
                            var examples = $('.source_example');

                            sectionHeaders.length.should.be.greaterThan(1);
                            examples.length.should.be.greaterThan(0);

                            done();
                        }
                    });
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

                    jsdom.env({
                        html: res.text,
                        src: [jq],
                        done: function (errors, window) {
                            var $ = window.$;
                            var examples = $('.source_example');

                            examples.length.should.equal(1);

                            done();
                        }
                    });
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

                    jsdom.env({
                        html: res.text,
                        src: [jq],
                        done: function (errors, window) {
                            var $ = window.$;

                            $('[href*="bootstrap.css"]').length.should.equal(1);
                            $('body > style').length.should.be.greaterThan(0);
                            $('body > script').length.should.be.greaterThan(0);

                            done();
                        }
                    });
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

                    jsdom.env({
                        html: res.text,
                        src: [jq],
                        done: function (errors, window) {
                            var $ = window.$;
                            var examples = $('.source_example');

                            $('.__clear').length.should.equal(1);
                            examples.length.should.equal(0);

                            done();
                        }
                    });
                });
        });
    });

    describe('GET from API /docs/spec?clarify=true&fromApi=true...', function () {
        var urlFromApi = 'http://localhost:8080/docs/spec/?clarify=true&fromApi=true';

        it('should return nothing (&sections=77&apiUpdate=true)', function (done) {
            this.timeout(10000);
            request(urlFromApi)
                .get('&sections=77&apiUpdate=true')
                .expect(500)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    jsdom.env({
                        html: res.text,
                        src: [jq],
                        done: function (errors, window) {
                            var $ = window.$;
                            var examples = $('.source_example');

                            examples.length.should.equal(0);

                            done();
                        }
                    });
                });
        });

        it('should return all sections', function (done) {
            request(urlFromApi)
                .get()
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    jsdom.env({
                        html: res.text,
                        src: [jq],
                        done: function (errors, window) {
                            var $ = window.$;
                            var sectionHeaders = $('.source_section_h');
                            var examples = $('.source_example');

                            sectionHeaders.length.should.be.greaterThan(1);
                            examples.length.should.be.greaterThan(0);

                            done();
                        }
                    });
                });
        });

        it('should return one example', function (done) {
            request(urlFromApi)
                .get('&sections=1.1')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    jsdom.env({
                        html: res.text,
                        src: [jq],
                        done: function (errors, window) {
                            var $ = window.$;
                            var examples = $('.source_example');

                            examples.length.should.equal(1);

                            done();
                        }
                    });
                });
        });

        it('should have injected resources', function (done) {
            request(urlFromApi)
                .get('&sections=1.1')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    jsdom.env({
                        html: res.text,
                        src: [jq],
                        done: function (errors, window) {
                            var $ = window.$;

                            $('[href*="bootstrap.css"]').length.should.equal(1);
                            $('body > style').length.should.be.greaterThan(0);
                            $('body > script').length.should.be.greaterThan(0);

                            done();
                        }
                    });
                });
        });

        it('should change template', function (done) {
            request(urlFromApi)
                .get('&tpl=clear')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    jsdom.env({
                        html: res.text,
                        src: [jq],
                        done: function (errors, window) {
                            var $ = window.$;
                            var examples = $('.source_example');

                            $('.__clear').length.should.equal(1);
                            examples.length.should.equal(0);

                            done();
                        }
                    });
                });
        });
    });
});