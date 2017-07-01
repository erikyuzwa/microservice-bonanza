
'use strict';

const Express = require('express');
const Router = Express.Router;
let context = new Router();
let bodyParser = require('body-parser');
let yamlConfig = require('node-yaml-config');
const path = require('path');
let apiRoutes = require('./routes');

let config = yamlConfig.load(path.resolve(__dirname, './collector.yml'));

let app = Express();

app.use('/api', apiRoutes);

app.use (bodyParser.json());
app.use (context);
app.listen(config.server.port, config.server.host, function() {
	console.log('microservice %s listening on %s:%d', config.name, config.server.host, config.server.port);
});

module.exports = app;
