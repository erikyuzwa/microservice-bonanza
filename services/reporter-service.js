#!/usr/bin/env node
/**
 * @name: reporter-service
 * @desc: this microservice starts up and listens for a GET `/api/v1/reporter?documentNumber` query. When that happens,
 *        pull all the records stored in our persistent storage and return a JSON object in the response.
 *
 * @TODO: move the server connection info to a global ./config.yml
 */
'use strict';

const Hapi = require('hapi');
const _ = require('lodash');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: 8080
});

server.register([
    {
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

// Add the GET route
server.route({
    method: 'GET',
    path: '/api/v1/reporter/{documentNumber?}',
    handler: (request, reply) => {

      let mysql = server.plugins['hapi-mysql'];
      let params = request.query;
      let status = 'ok';
      let details;

      if (_.has(params, 'documentNumber')) {

        let dn = params.documentNumber;
        mysql.pool.getConnection(function(err, connection) {

          // Since we have different snippets of data, let's be real fancy and structure our SQL to make use of a UNION
          // the idea being that the first row returned will ALWAYS be our "Invoice" document...at least that's the idea
          connection.query(
            'SELECT * from records WHERE documentType = ? AND documentNumber = ? UNION SELECT * from records WHERE documentType = ? AND originalDocumentNumber = ? ORDER BY date',
            ['Invoice', dn, 'Response', dn],
            function(err, rows) {

              if (err) {
                throw new Error(err);
              }

              //console.log(rows);
              if (rows && rows.length) {

                // rows[0] is hopefully our 'Invoice' row, so let's peel that off
                let head = rows.shift();

                // shift will update our rows Array - but we also want to strip out the "id" column so let's
                // use _.map to iterate each rowItem and _.omit() our column
                let tail = _.map(rows, (rowItem) => {
                    return _.omit(rowItem, 'id');
                });

                details = {
                  original : {
                      'documentType': 'Invoice',
                      'documentNumber': dn,
                      'date': head['date'],
                      'amount': head['amount'],
                      'currency': head['currency']
                  },
                  responses: tail
                };

              } else {
                status = 'error';
                details = 'no matching record(s) found';
              }

              return reply({'status': status, 'details': details});
            }
          );

          // And done with the connection.
          connection.release();
        });

      } else {
        status = 'error';
        details = 'invalid or missing query parameter documentNumber';
        return reply({'status': status, 'details': details});
      }

    }
});

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }

    console.log('reporter microservice running at : ', server.info.uri);
});
