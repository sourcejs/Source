var should = require('should');
var assert = require('assert');
var request = require('supertest');

describe('Routing', function () {
    var url = 'http://localhost:8080';

    describe('Specs', function () {
        it('should return list of specs', function (done) {
            var body = {
                test: true
            };
            request(url)
                .post('/api/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base/base');
                    done();
                });
        });
        it('should return spec by ID', function (done) {
            var body = {
                test: true,
                id: 'base/base'
            };
            request(url)
                .post('/api/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('url');
                    res.body.should.have.property('lastmod');
                    done();
                });
        });
        it('should not have cat info', function (done) {
            var body = {
                test: true
            };
            request(url)
                .post('/api/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.not.have.property('specFile');
                    done();
                });
        });
    });

    describe('Specs Filter', function () {
        it('should return only specs with info field', function (done) {
            var body = {
                test: true,
                filter: {
                    fields:["info"]
                }
            };
            request(url)
                .post('/api/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base/base');
                    res.body.should.not.have.property('base/button');
                    done();
                });
        });
        it('should return only specs with info and title field', function (done) {
            var body = {
                test: true,
                filter: {
                    fields:["info","title"]
                }
            };
            request(url)
                .post('/api/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base/base');
                    res.body.should.not.have.property('base/button');
                    done();
                });
        });
        it('should return only specs WITHOUT info', function (done) {
            var body = {
                test: true,
                filterOut: {
                    fields:["info"]
                }
            };
            request(url)
                .post('/api/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base/button');
                    res.body.should.not.have.property('base/base');
                    done();
                });
        });
        it('should return only specs WITHOUT info and cat', function (done) {
            var body = {
                test: true,
                filterOut: {
                    fields:["info","cat"]
                }
            };
            request(url)
                .post('/api/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base/button');
                    res.body.should.not.have.property('base/base');
                    done();
                });
        });
        it('should return only specs WITH info and WITHOUT keywords', function (done) {
            var body = {
                test: true,
                filter: {
                    fields:["info"]
                },
                filterOut: {
                    fields:["keywords"]
                }
            };
            request(url)
                .post('/api/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base/base');
                    res.body.should.not.have.property('base/button');
                    done();
                });
        });
    });

    describe('HTML', function () {
        it('should return list of html', function (done) {
            var body = {
                test: true
            };
            request(url)
                .post('/api/specs/html')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base/btn');
                    done();
                });
        });
        it('should return HTML by ID', function (done) {
            var body = {
                test: true,
                id: 'base/btn'
            };
            request(url)
                .post('/api/specs/html')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('contents');
                    done();
                });
        });
    });
});