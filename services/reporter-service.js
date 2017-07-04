#!/usr/bin/env node
/**
 * @name: reporter-service
 * @desc: this microservice starts up and subscribes directly to our rabbit message bus. When we hear a "parsedInvoice"
 *        message, then we take it and produce a JSON report
 */
'use strict';

const Hapi = require('hapi');
const _ = require('lodash');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 4000
});

server.register([
    {
        register: require('hapi-rabbit'),
        options: {
            url: 'amqp://localhost'
        }
    }
], function (err) {
    if (err) {
        throw err;
    }
});

// Add the route
server.route({
    method: 'POST',
    path: '/api/v1/parser',
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

    let rabbit = server.plugins['hapi-rabbit'];
    rabbit.createContext(function(err, context) {

        if (err){
            throw err;
        }

        rabbit.subscribe(context, 'exchange', function(err, message) {

            console.log('message', message);


        });
    });

    console.log('Server running at:', server.info.uri);
});
