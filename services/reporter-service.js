#!/usr/bin/env node
/**
 * @name: reporter-service
 * @desc: this microservice starts up and listens for a GET `/api/v1/reporter?documentNumber` query. When that happens,
 *        pull all the records stored in our persistent storage and return a JSON object in the response.
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

// Add the GET route
server.route({
    method: 'GET',
    path: '/api/v1/reporter/{documentNumber?}',
    handler: (request, reply) => {

      let params = request.query;
      let status = 'ok';
      let details;
      console.log(params);
      if (_.has(params, 'documentNumber')) {

        details = 'using documentNumber ' + params.documentNumber;

      } else {
        status = 'error';
        details = 'invalid or missing query parameter documentNumber';
      }

      return reply({'status': status, 'details': details});
    }
});

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }

    console.log('reporter microservice running at : ', server.info.uri);
});
