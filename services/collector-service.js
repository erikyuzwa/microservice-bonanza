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
 *
 * @TODO:
 *
 */
'use strict';

const Hapi = require('hapi');
const _ = require('lodash');
const Path = require('path');
const YamlConfig = require('node-yaml-config');
const Config = YamlConfig.load(Path.resolve(__dirname, '../config.yml'));

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: Config.server.collector_port
});

server.register([
    {
        register: require('hapi-rabbit'),
        options: {
            url: Config.rabbit.url
        }
    }
], (err) => {

    if (err) {
        throw new Error(err);
    }
});

// Add the route
server.route({
    method: 'POST',
    path: Config.api + '/collector',
    config: {
        payload: { output: 'data', parse: true, allow: 'application/json' }
    },
    handler: (request, reply) => {

    	//console.log(request.payload);
    	const payload = request.payload;
    	let count = 0;
    	let status = 'ok';
    	const rabbit = request.server.plugins['hapi-rabbit'];

    	if (_.isObject(payload) && _.isEmpty(payload)) {
    		return reply({
	            'status': status,
	            'invoices-received': count
            });
	    }

    	// we should account for either a single JSON being POST'd to our collector
	    // or an Array of them
	    if (_.isArray(payload)) {
	    	_.forOwn(payload, (v, k) => {

	    		// console.log(v);
    			// beam each one to our parser microservice
			    if (rabbit) {
			    	rabbit.createContext((err, context) => {

			    		if (err) {
			    			throw new Error(err);
					    }

					    rabbit.publish(context, 'exchange', 'collectedInvoice', v, (err, data) => {

					    	if (err) {
					    		throw new Error(err);
						    }

					    	console.log('[publish] messageObject', data);
					    });
				    });
			    }

    			count++;
		    });
	    }
	    else if (_.isObject(payload)) {

		    // beam each one to our parser microservice
		    if (rabbit) {
			    rabbit.createContext((err, context) => {

				    if (err) {
					    throw new Error(err);
				    }

				    rabbit.publish(context, 'exchange', 'collectedInvoice', payload, (err, data) => {

				    	if (err) {
				    		throw new Error(err);
					    }

					    console.log('[publish] messageObject', data);
				    });
			    });
	        }

	    	count = 1;
	    }
	    else {
	    	status = 'error';
	    }

        return reply({
	        'status': status,
	        'invoices-received': count
        });
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }

    console.log('collector microservice running at : ', server.info.uri);
});

module.exports = server;
