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
const path = require('path');
const yaml_config = require('node-yaml-config');
let config = yaml_config.load(path.resolve(__dirname, '../config.yml'));

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: config.server.reporter_port
});

server.register([
    {
        register: require('hapi-mysql'),
        options: {
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.db,
            connectionLimit : config.database.connection_pool_limit,
            debug: config.database.debug_mode
        }
    }
], function (err) {
    if (err) {
        throw err;
    }
});

// Add the GET route
server.route({
    method: 'GET',
    path: config.api + '/reporter',
    handler: (request, reply) => {

      let mysql = server.plugins['hapi-mysql'];
      let status = 'ok';
      let queryParams = [];
      let data;

      let queryString = 'SELECT "Invoice" as Type, documentNumber as invoiceNumber, documentNumber as docNumber, date, amount, currency, "" as status FROM invoices UNION SELECT "Response", originalDocumentNumber as invoiceNumber, documentNumber as docNumber, date, amount, currency, status FROM responses ORDER BY invoiceNumber, date';

      mysql.pool.getConnection(function(err, connection) {

      connection.query(
        queryString,
        queryParams,
        function(err, rows) {

          if (err) {
            throw new Error(err);
          }

          console.log(rows);
          if (rows && rows.length) {

            let head = {};
            let tail = [];
            data = [];

            _.each(rows, (row) => {

                if (row['Type'] === 'Invoice') {

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
                      'documentNumber': row['docNumber'],
                      'date': row['date'],
                      'amount': row['amount'],
                      'currency': row['currency']
                    };

                    tail = [];
                } else if (row['Type'] === 'Response') {
                    let item = {
                        'documentType': 'Response',
                        'documentNumber': row['docNumber'],
                        'originalDocumentNumber': row['invoiceNumber'],
                        'date': row['date'],
                        'amount': row['amount'],
                        'currency': row['currency'],
                        'status': row['status']
                    };

                    // keep appending the response items to our tail
                    tail.push(item);
                }

            });

          } else {
            status = 'error';
            data = 'no matching record(s) found';
          }

          return reply({'status': status, 'details': data});
        }
      );

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
