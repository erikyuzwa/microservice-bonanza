#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
let spawn = require('child_process').spawn;

let services = ['collector-service', 'parser-service', 'persister-service', 'reporter-service'];

function mkdirIfNotExist(filepath) {
    let dirname = path.dirname(filepath);
    if (!fs.existsSync(dirname)) {
       fs.mkdirSync(dirname);
    }
}

services.forEach(function(service) {

  mkdirIfNotExist('./log/' + service + '.log');
  let log  = fs.createWriteStream('./log/' + service + '.log');
  let proc = spawn('node', ['./services/' + service + '.js', '']);

  proc.stdout.pipe(log);
  proc.stderr.pipe(log);

  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
});
