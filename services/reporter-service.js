#!/usr/bin/env node
/**
 * @name: reporter-service
 * @desc: this microservice starts up and listens for a GET `/api/v1/reporter?documentNumber` query. When that happens,
 *        pull all the records stored in our persistent storage and return a JSON object in the response.
 */
'use strict';

const Hapi = require('hapi');
const _ = require('lodash');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 6000
});

// Add the GET route
server.route({
    method: 'GET',
    path: '/api/v1/reporter',
    config: {
        payload: { output: 'data', parse: true, allow: 'application/json' }
    },
    handler: (request, reply) => {
        
    	console.log(request.payload);
    	let payload = request.payload;
    	let newInvoice = {};
    	let status = 'ok';

    	if (_.isObject(payload)) {

            newInvoice = _.pick(payload, ['date', 'amount', 'currency']);
            if (_.has(payload, 'responseNumber')) {
                console.log('hello');
                newInvoice.documentType = 'Response';
                newInvoice.documentNumber = payload['responseNumber'];
                newInvoice.status = payload.status;
            } else if (_.has(payload, 'invoiceNumber')) {
                console.log('world');
                newInvoice.documentType = 'Invoice';
                newInvoice.documentNumber = payload['invoiceNumber'];
            }

            console.log(newInvoice);

	    } else {
    	    status = 'error';
        }

        return reply({'status': status, 'invoice': newInvoice});
    }
});

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }

    console.log('reporter microservice running at : ', server.info.uri);
});
