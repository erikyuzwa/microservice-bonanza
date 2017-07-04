#!/usr/bin/env node
/**
 * @name: collector-service
 * @desc: this microservice starts up and listens for HTTP POST messages which could either be by a browser or via
 *        a tool like Postman.
 *
 *        Any JSON data (or Array of JSON data) is then published via rabbit to the message bus.
 *
 *        This microservice will then produce a response back to the caller with a JSON object containing a status
 *        code and number of invoice items sent in the request.
 *
 *        { "status": "ok", "invoices-received": <count of JSON objects in request>}
 */
'use strict';

const Hapi = require('hapi');
const _ = require('lodash');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 3000
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
    path: '/api/v1/collector',
    config: {
        payload: { output: 'data', parse: true, allow: 'application/json' }
    },
    handler: (request, reply) => {

    	console.log(request.payload);
    	let payload = request.payload;
    	let count = 0;
    	let status = 'ok';

    	let rabbit = request.server.plugins['hapi-rabbit'];

    	// we should account for either a single JSON being POST'd to our collector
	    // or an Array of them
	    if (_.isArray(payload)) {
	    	_.forOwn(payload, function(v, k) {
    			// console.log(v);

    			// beam each one to our parser microservice
			    rabbit.createContext(function(err, context) {
				    if (err) {
					    console.log('err', err);
				    }

				    rabbit.publish(context, 'exchange', 'collectedInvoice', v, function (err, data) {
					    console.log('messageObject', data);
				    });
			    });

    			count++;
		    });
	    } else if (_.isObject(payload)) {

	    	// beam each one to our parser microservice
		    rabbit.createContext(function(err, context) {
			    if (err) {
				    console.log('err', err);
			    }

			    rabbit.publish(context, 'exchange', 'collectedInvoice', payload, function (err, data) {
				    console.log('messageObject', data);
			    });
		    });

	    	count = 1;
	    } else {
	    	status = 'error';
	    }

        return reply({'status': status, 'invoices-received': count});
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }

    console.log('collector microservice running at : ', server.info.uri);
});
