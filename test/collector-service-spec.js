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

const Server = require('../services/collector-service.js');

const requestDefaults = {
    method: 'POST',
    url: Config.api,
    payload: {}
};

describe('unit tests - collector-service', () => {

    it('endpoint test | POST / | empty payload', (done) => {

        const request = Object.assign({}, requestDefaults);
        request.payload = JSON.stringify(request.payload);

        Server
            .inject(request)
            .then(response => {

                expect(response.statusCode).to.equal(404);
                done();
            }, (err) => {

                done(err);
            });

    });

    it('endpoint test | POST /collector | empty payload', (done) => {

        const request = Object.assign({}, requestDefaults);
        request.url += '/collector';
        request.payload = JSON.stringify(request.payload);

        Server
            .inject(request)
            .then(response => {

                expect(response.statusCode).to.equal(200);
                done();
            }, (err) => {

                done(err);
            });
    });
});
