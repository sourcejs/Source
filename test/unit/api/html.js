var should = require('should');
var request = require('supertest');

describe('API test /api/specs/html', function () {
    var url = 'http://127.0.0.1:8080';

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
        it('should return HTML by ID and by section', function (done) {
            var body = {
                id: 'base-test/button',
                sections: '1'
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

                    var section1 = res.body.contents.length === 1;

                    section1.should.be.ok;
                    done();
                });
        });
        it('should NOT return HTML of non existent section', function (done) {
            var body = {
                id: 'base-test/button',
                sections: '11'
            };
            request(url)
                .get('/api-test/specs/html')
                .expect(404)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;

                    var section = !!(res.body.contents && res.body.contents.length === 1);

                    section.should.not.be.ok;
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
