var should = require('should');
var assert = require('assert');
var request = require('supertest');
var path = require('path');

var pathToMasterApp = path.resolve('./');
var parseData = require(path.join(pathToMasterApp, 'core/api/parseData'));
var loadOptions = require(path.join(pathToMasterApp, 'core/loadOptions'));
global.opts = loadOptions(path.resolve(pathToMasterApp));

var parseSpecs = new parseData({
    scope: 'specs',
    path: global.opts.core.api.specsData
});

describe('Internal API tests', function () {
    describe('Check parseData:specs', function () {
        it('should return list of specs', function (done) {
            var data = parseSpecs.getAll();

            data.should.have.property('docs/base');
            done();
        });

        it('should return spec by ID', function (done) {
            var data = parseSpecs.getByID('docs/base');

            data.should.have.property('url');
            done();
        });
    });
});


describe('Routing', function () {
    var url = 'http://localhost:8080';

    describe('Check real API data available', function () {
        it('should return list of specs', function (done) {
            var body = {
            };
            request(url)
                .get('/api/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('docs/base');
                    done();
                });
        });
    });

    describe('Specs', function () {
        it('should return list of specs', function (done) {
            var body = {
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base-test/base');
                    done();
                });
        });
        it('should return spec by ID', function (done) {
            var body = {
                id: 'base-test/base'
            };
            request(url)
                .get('/api-test/specs')
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
            };
            request(url)
                .get('/api-test/specs')
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
        it('should return only specs WITH info field', function (done) {
            var body = {
                filter: {
                    fields:["info"]
                }
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base-test/base');
                    res.body.should.not.have.property('base-test/button');
                    done();
                });
        });
        it('should return only specs WITH keywords, info, and title field', function (done) {
            var body = {

                filter: {
                    fields:["keywords","info","title"]
                }
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.not.have.property('base-test/base');
                    res.body.should.not.have.property('base-test/button');
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
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base-test/button');
                    res.body.should.not.have.property('base-test/base');
                    done();
                });
        });
        it('should return only specs WITHOUT url, info and cat', function (done) {
            var body = {
                test: true,
                filterOut: {
                    fields:["url","info","cat"]
                }
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.not.have.property('base-test/button');
                    res.body.should.not.have.property('base-test/base');
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
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base-test/base');
                    res.body.should.not.have.property('base-test/button');
                    done();
                });
        });
        it('should return only specs WITH info and cat but WITHOUT keywords and thumbnail', function (done) {
            var body = {
                test: true,
                filter: {
                    fields:["info","cat"]
                },
                filterOut: {
                    fields:["keywords"]
                }
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base-test/base');
                    res.body.should.not.have.property('base-test/button');
                    done();
                });
        });
    });

    describe('Specs Filter Tags', function () {
        it('should return only specs WITH "html" tag', function (done) {
            var body = {
                test: true,
                filter: {
                    tags:["html"]
                }
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base-test/base');
                    res.body.should.not.have.property('base-test/button');
                    done();
                });
        });

        it('should return only specs WITH "html" and "tag" tags', function (done) {
            var body = {
                test: true,
                filter: {
                    tags:["html","tag"]
                }
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base-test/base');
                    res.body.should.not.have.property('base-test/button');
                    done();
                });
        });

        it('should return only specs WITHOUT "html" and "tag" tags', function (done) {
            var body = {
                test: true,
                filterOut: {
                    tags:["html","tag"]
                }
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.not.have.property('base-test/base');
                    res.body.should.have.property('base-test/button');
                    done();
                });
        });

        it('should return only specs WITH "html" and WITHOUT "some" tags', function (done) {
            var body = {
                test: true,
                filter: {
                    tags:["html"]
                },
                filterOut: {
                    tags:["some"]
                }
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base-test/base');
                    res.body.should.not.have.property('base-test/button');
                    done();
                });
        });
    });

    describe('Specs Filter Cats', function () {
        it('should return only project cat specs', function (done) {
            var body = {
                test: true,
                filter: {
                    cats:["project-test"]
                }
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('project-test/project-spec');
                    res.body.should.not.have.property('base-test/button');
                    done();
                });
        });

        it('should return only base cat specs', function (done) {
            var body = {
                test: true,
                filter: {
                    cats:["base"]
                }
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.not.have.property('project-test/project-spec');
                    res.body.should.have.property('base-test/button');
                    done();
                });
        });

        it('should return all except project specs', function (done) {
            var body = {
                test: true,
                filterOut: {
                    cats:["project-test"]
                }
            };
            request(url)
                .get('/api-test/specs')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.not.have.property('project-test/project-spec');
                    res.body.should.have.property('base-test/button');
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
                .get('/api-test/specs/html')
                .expect(200)
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.should.be.json;
                    res.body.should.have.property('base-test/btn');
                    done();
                });
        });
        it('should return HTML by ID', function (done) {
            var body = {

                id: 'base-test/btn'
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
});