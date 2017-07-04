#!/usr/bin/env node
/**
 * @name: persister-service
 * @desc: this microservice starts up and subscribes directly to our rabbit message bus. When we hear a "parsedInvoice"
 *        message, then we take it and dump it in our database / storage.
 *
 * @TODO: perhaps allow a web endpoint for DEBUG sessions of this service?
 * @TODO: move the server connection info to a global ./config.yml
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
    }, {
        register: require('hapi-mysql'),
        options: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'invoices'
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
    let mysql = server.plugins['hapi-mysql'];
    rabbit.createContext(function(err, context) {

        if (err){
            throw err;
        }

        rabbit.subscribe(context, 'exchange', function(err, message) {

            //console.log('[subscribe] message', message);
            let messageData;

            if (_.has(message, 'type')) {
            	if (message.type === 'parsedInvoice') {
            		messageData = message.data;
            		if (_.isObject(messageData)) {

                        console.log('[persist] parsedInvoice - ', messageData);
                        mysql.pool.getConnection(function(err, connection) {

                          // Use the connection
                          connection.query(
                            'INSERT INTO records (documentType, documentNumber, date, amount, currency, originalDocumentNumber, status) VALUES (?,?,?,?,?,?,?)',
                            [messageData.documentType,
                             messageData.documentNumber,
                             messageData.date,
                             messageData.amount,
                             messageData.currency,
                             messageData.originalDocumentNumber,
                             messageData.status
                            ],
                            function(err, rows) {

                              if(err) {
                                throw new Error(err);
                              }

                              console.log('[persist] rows - ', rows);
                            }
                          );

                          // And done with the connection.
                          connection.release();
                        });

		            }
	            }
            }


        });
    });

    console.log('persister microservice running at : ', server.info.uri);
});
