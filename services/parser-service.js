#!/usr/bin/env node
/**
 * @name: parser-service
 * @desc: this microservice starts up and subscribes directly to our rabbit message bus. When we hear a "collectedInvoice"
 *        message, then we take it and parse / validate it. If our validation succeeds, then we post it back to
 *        rabbit as a "parsedInvoice" message.
 *
 * @TODO: perhaps allow a web endpoint for DEBUG sessions of this service?
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

/*
* // turf this once we move the parsing logic into the rabbit subscriber area
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
*/

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }

    let rabbit = server.plugins['hapi-rabbit'];
    rabbit.createContext(function(err, context){

        if (err){
            throw err;
        }

        rabbit.subscribe(context, 'exchange', function(err, message) {
            console.log('message', message);
             //rabbit.publish(context, 'exchange', 'collectedInvoice', payload, function (err, data) {
			//	console.log('messageObject', data);
			 //});
        });
    });

    console.log('parser microservice running at : ', server.info.uri);
});
