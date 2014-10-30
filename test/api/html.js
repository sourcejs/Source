var should = require('should');
var assert = require('assert');
var request = require('supertest');
var path = require('path');

describe('API test /api/specs/html', function () {
    var url = 'http://localhost:8080';

    describe('GET /api/specs/html', function () {
        it('should return list of html', function (done) {
            var body = {
            };
            request(url)
                .get('/api-test/specs/html')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base-test/button');
                    done();
                });
        });
        it('should return HTML by ID', function (done) {
            var body = {
                id: 'base-test/button'
            };
            request(url)
                .get('/api-test/specs/html')
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

    describe('POST /api/specs/html', function () {
        it('it should POST new spec and return updated object', function (done) {
            var body = {
                data: {
                    "base-test": {
                        "posted": {
                            "specFile": {
                                "description": "This spec was posted through API",
                                "id": "base-test/posted",
                                "contents": [
                                    {
                                        "id": "1",
                                        "class": "",
                                        "title": "",
                                        "html": [
                                            "<button type='button' class='btn-posted'>Button</button>"
                                        ],
                                        "nested": []
                                    }
                                ]
                            }
                        }
                    }
                }
            };
            request(url)
                .post('/api-test/specs/html')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body['base-test'].should.have.property('posted');
                    done();
                });
        });
    });

    describe('DELETE /api/specs/html', function () {
        it('it should return object without "base-test/posted"', function (done) {
            var body = {
                id: 'base-test/posted'
            };
            request(url)
                .delete('/api-test/specs/html')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.body['base-test'].should.not.have.property('posted');
                    done();
                });
        });
    });
});