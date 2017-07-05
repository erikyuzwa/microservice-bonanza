'use strict';

// requires for testing
const Code      = require('code');
const expect    = Code.expect;
const Lab       = require('lab');
const lab       = exports.lab = Lab.script();

// use some BDD verbage instead of lab default
const describe  = lab.describe;
const it        = lab.it;

const Path = require('path');
const YamlConfig = require('node-yaml-config');
const Config = YamlConfig.load(Path.resolve(__dirname, '../config.yml'));

const Server = require('../services/parser-service.js');

describe('unit tests - parser-service', () => {




});

