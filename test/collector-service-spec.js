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
            .then((response) => {

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
            .then((response) => {

                expect(response.statusCode).to.equal(200);
                done();
            }, (err) => {

                done(err);
            });
    });

    it('endpoint test | POST /collector | 1 payload of valid invoice', (done) => {

        const request = Object.assign({}, requestDefaults);
        request.url += '/collector';
        request.payload = {
            'invoiceNumber': '224567',
            'date': '2016-04-17',
            'amount': '45.45',
            'currency': 'CAD'
        };

        Server
            .inject(request)
            .then((response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal({ 'status':'ok','invoices-received':1 });
                done();
            }, (err) => {

                done(err);
            });
    });

    // TODO - figure out how to fail this test properly
    it('endpoint test | POST /collector | 1 payload of invalid invoice', (done) => {

        const request = Object.assign({}, requestDefaults);
        request.url += '/collector';
        request.payload = {
            'invoiceNumber': '224567',
            'date': '2016-04-17',
            'amount': '45.45'
            //'currency': 'CAD' -- dropping this key field on purpose
        };

        Server
            .inject(request)
            .then((response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal({ 'status':'ok','invoices-received':1 });
                done();
            }, (err) => {

                done(err);
            });
    });



    it('endpoint test | POST /collector | 1 payload of valid response', (done) => {

        const request = Object.assign({}, requestDefaults);
        request.url += '/collector';
        request.payload = {
            'responseNumber': '15647',
            'originalInvoiceNumber': '248164',
            'status': 'Pending',
            'date': '2016-08-20',
            'amount': '647.22',
            'currency': 'CAD'
        };

        Server
            .inject(request)
            .then((response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal({ 'status':'ok','invoices-received':1 });
                done();
            }, (err) => {

                done(err);
            });
    });

    // TODO - figure out how to fail this test properly
    it('endpoint test | POST /collector | 1 payload of invalid response', (done) => {

        const request = Object.assign({}, requestDefaults);
        request.url += '/collector';
        request.payload = {
            'responseNumber': '15647',
            'originalInvoiceNumber': '248164',
            'status': 'Pending',
            'date': '2016-08-20',
            'amount': '647.22'
            //'currency': 'CAD' -- dropping this key field on purpose
        };

        Server
            .inject(request)
            .then((response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal({ 'status':'ok','invoices-received':1 });
                done();
            }, (err) => {

                done(err);
            });
    });



    it('endpoint test | GET /collector | empty query params', (done) => {

        const request = Object.assign({}, requestDefaults);
        request.url += '/collector';
        request.method = 'GET';

        Server
            .inject(request)
            .then((response) => {

                expect(response.statusCode).to.equal(404);
                done();
            }, (err) => {

                done(err);
            });
    });
});
