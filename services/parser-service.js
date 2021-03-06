#!/usr/bin/env node
/**
 * @name: parser-service
 * @desc: this microservice starts up and subscribes directly to our rabbit message bus. When we hear a "collectedInvoice"
 *        message, then we take it and parse / validate it. If our validation succeeds, then we post it back to
 *        rabbit as a "parsedInvoice" message.
 *
 * @TODO: perhaps allow a web endpoint for DEBUG sessions of this service?
 * @TODO: figure out a way to publish an invalid Model to either Rabbit or maybe a dead letter table..?
 */
'use strict';

const Hapi = require('hapi');
const _ = require('lodash');
const Path = require('path');
const YamlConfig = require('node-yaml-config');
const Config = YamlConfig.load(Path.resolve(__dirname, '../config.yml'));

const validInvoiceKeys = ['documentType', 'documentNumber', 'date', 'amount', 'currency'];
const validResponseKeys = ['documentType', 'documentNumber', 'originalDocumentNumber', 'status', 'date', 'amount', 'currency'];

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: Config.server.parser_port
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
        throw err;
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }

    const rabbit = server.plugins['hapi-rabbit'];
    rabbit.createContext((err, context) => {

        if (err) {
            throw err;
        }

        let messageData;
        let parsedInvoice = {};

        rabbit.subscribe(context, 'exchange', (err, message) => {
            //console.log('[subscribe] message', message);
	        if (err) {
		        throw new Error(err);
	        }

            if (_.has(message, 'type')) {
	        	if (message.type === 'collectedInvoice') {
	        		messageData = message.data;
	        		if (_.isObject(messageData)) {
	        			console.log('[parser] collectedInvoice - ', messageData);
	        			let validModel = true;
	        			parsedInvoice = _.pick(messageData, ['date', 'amount', 'currency']);
	        			if (_.has(messageData, 'responseNumber')) {
	        				parsedInvoice.documentType = 'Response';
	        				parsedInvoice.documentNumber = messageData.responseNumber;
	        				parsedInvoice.originalDocumentNumber = messageData.originalInvoiceNumber;
	        				parsedInvoice.status = messageData.status;

	        				_.each(validResponseKeys, (v) => {

	        					if (!parsedInvoice[v]) {
	        						validModel = false;
						        }
					        });

			            }
			            else if (_.has(messageData, 'invoiceNumber')) {
					        parsedInvoice.documentType = 'Invoice';
					        parsedInvoice.documentNumber = messageData.invoiceNumber;

					        _.each(validInvoiceKeys, (v) => {

	        					if (!parsedInvoice[v]) {
	        						validModel = false;
						        }
					        });
				        }

				        // TODO - play with a way to publish an Error to the Rabbit bus with our invalid model
				        if (!validModel) {
	        				console.log('[parser] missing or invalid keys in object - ', parsedInvoice);
	        				return;
				        }

			            rabbit.publish(context, 'exchange', 'parsedInvoice', parsedInvoice, (err, data) => {

			            	if (err) {
			            		throw new Error(err);
				            }

				            console.log('[publish] messageObject', data);
			            });
	        		}
	        	}
	        }
        });
    });
    console.log('parser microservice running at : ', server.info.uri);
});

module.exports = server;
