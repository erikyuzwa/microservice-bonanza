#!/usr/bin/env node
/**
 * @name: reporter-service
 * @desc: this microservice starts up and listens for a GET `/api/v1/reporter` query. When that happens,
 *        pull all the records stored in our persistent storage and return a JSON object in the response
 *        in the format:
 *        [{'original': {}, 'responses': []}]
 *
 * @TODO: would be nice to create a way to specify a documentNumber as a query param
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
    port: Config.server.reporter_port
});

server.register([
    {
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

// Add the GET route
server.route({
    method: 'GET',
    path: Config.api + '/reporter',
    handler: (request, reply) => {

        const mysql = server.plugins['hapi-mysql'];
        const queryParams = [];
        let data;
        let status = 'ok';

        const queryString = 'SELECT "Invoice" as Type, documentNumber as invoiceNumber, documentNumber as docNumber, date, amount, currency, "" as status FROM invoices UNION SELECT "Response", originalDocumentNumber as invoiceNumber, documentNumber as docNumber, date, amount, currency, status FROM responses ORDER BY invoiceNumber, date';

        mysql.pool.getConnection((err, connection) => {

            connection.query(
                queryString,
                queryParams,
                (err, rows) => {

                    if (err) {
                        throw new Error(err);
                    }

                    console.log(rows);

                    if (rows && rows.length) {

                        let head = {};
                        let tail = [];
                        data = [];

                        _.each(rows, (row) => {

                            if (row.Type === 'Invoice') {

                                // if one of our head or tail has something, then push it to our result data Array
                                if (!_.isEmpty(head) || tail.length) {
                                    data.push({
                                        original: head,
                                        responses: tail
                                    });
                                }

                                // create the object which populates the 'original' object
                                head = {
                                    'documentType': 'Invoice',
                                    'documentNumber': row.docNumber,
                                    'date': row.date,
                                    'amount': row.amount,
                                    'currency': row.currency
                                };

                                tail = [];

                            }
                            else if (row.Type === 'Response') {
                                const item = {
                                    'documentType': 'Response',
                                    'documentNumber': row.docNumber,
                                    'originalDocumentNumber': row.invoiceNumber,
                                    'date': row.date,
                                    'amount': row.amount,
                                    'currency': row.currency,
                                    'status': row.status
                                };

                                // keep appending the response items to our tail
                                tail.push(item);
                            }
                        });
                    }
                    else {
                        status = 'error';
                        data = 'no matching record(s) found';
                    }

                    return reply({
                        'status': status,
                        'details': data
                    });
                });

            // release the connection.
            connection.release();
        });
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }

    console.log('reporter microservice running at : ', server.info.uri);
});

module.exports = server;
