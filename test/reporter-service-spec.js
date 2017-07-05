'use strict';

// requires for testing
const Code      = require('code');
const expect    = Code.expect;
const Lab       = require('lab');
const lab       = exports.lab = Lab.script();

// use some BDD verbage instead of lab default
const describe  = lab.describe;
const it        = lab.it;

const Path = require('path');
const YamlConfig = require('node-yaml-config');
const Config = YamlConfig.load(Path.resolve(__dirname, '../config.yml'));

const Server = require('../services/reporter-service.js');

const requestDefaults = {
    method: 'POST',
    url: Config.api
};

describe('unit tests - reporter-service', () => {

    it('endpoint test | POST / | empty payload', (done) => {

        const request = Object.assign({}, requestDefaults);
        request.payload = {};
        Server
            .inject(request)
            .then((response) => {

                expect(response.statusCode).to.equal(404);
                done();
            }, (err) => {

                done(err);
            });

    });

    it('endpoint test | POST /reporter | empty payload', (done) => {

        const request = Object.assign({}, requestDefaults);
        request.url += '/reporter';
        request.payload = {};

        Server
            .inject(request)
            .then((response) => {

                expect(response.statusCode).to.equal(404);
                done();
            }, (err) => {

                done(err);
            });
    });

    it('endpoint test | GET /reporter | empty query params', (done) => {

        const request = Object.assign({}, requestDefaults);
        request.method = 'GET';
        request.url += '/reporter';

        Server
            .inject(request)
            .then((response) => {

                expect(response.statusCode).to.equal(200);
                done();
            }, (err) => {

                done(err);
            });
    });
});

