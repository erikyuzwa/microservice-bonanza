#!/usr/bin/env node
/**
 * @name: persister-service
 * @desc: this microservice starts up and subscribes directly to our rabbit message bus. When we hear a "parsedInvoice"
 *        message, then we take it and dump it in our database / storage.
 *
 * @TODO: perhaps allow a web endpoint for DEBUG sessions of this service?
 */
'use strict';

const Hapi = require('hapi');
const _ = require('lodash');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: 5000
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

            // TODO - subscribe to a "parsedInvoice" message
             //rabbit.publish(context, 'exchange', 'collectedInvoice', payload, function (err, data) {
			//	    console.log('messageObject', data);
			 //});


        });
    });

    console.log('persister microservice running at : ', server.info.uri);
});
