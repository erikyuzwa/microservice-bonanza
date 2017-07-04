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
const Path = require('path');
const YamlConfig = require('node-yaml-config');
const Config = YamlConfig.load(Path.resolve(__dirname, '../config.yml'));

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: Config.server.persister_port
});

server.register([
    {
        register: require('hapi-rabbit'),
        options: {
            url: Config.rabbit.url
        }
    }, {
        register: require('hapi-mysql'),
        options: {
            host: Config.database.host,
            user: Config.database.user,
            password: Config.database.password,
            database: Config.database.db,
            connectionLimit : Config.database.connection_pool_limit,
            debug: Config.database.debug_mode
        }
    }
], (err) => {

    if (err) {
        throw err;
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }

    const rabbit = server.plugins['hapi-rabbit'];
    const mysql = server.plugins['hapi-mysql'];
    rabbit.createContext((err, context) => {

        if (err){
            throw err;
        }

        rabbit.subscribe(context, 'exchange', (err, message) => {

            //console.log('[subscribe] message', message);
            let messageData;

            if (_.has(message, 'type')) {
            	if (message.type === 'parsedInvoice') {
            		messageData = message.data;
            		if (_.isObject(messageData)) {

                        console.log('[persist] parsedInvoice - ', messageData);
                        mysql.pool.getConnection((err, connection) => {

                          // build our query - if our originalDocumentNumber and status are populated, then we're
                          // working with a Response. Otherwise we have an Invoice
                          let queryString;
                          let queryParams = [messageData.documentNumber, messageData.date, messageData.amount, messageData.currency];
                          if (_.has(messageData, 'status') || _.has(messageData, 'originalDocumentNumber')) {
                              queryString = 'INSERT INTO responses (documentNumber, date, amount, currency, originalDocumentNumber, status) VALUES (?,?,?,?,?,?)';
                              queryParams.push(messageData.originalDocumentNumber);
                              queryParams.push(messageData.status);
                          }
                          else {
                              queryString = 'INSERT INTO invoices (documentNumber, date, amount, currency) VALUES (?,?,?,?)';
                          }

                          // Use the connection
                          connection.query(
                            queryString,
                            queryParams,
                            (err, rows) => {

                              if (err) {
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

module.exports = server;
