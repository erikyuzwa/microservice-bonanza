#!/usr/bin/env node
'use strict';
const fs = require('fs');
let spawn = require('child_process').spawn;

let services = ['collector-service', 'parser-service', 'persister-service', 'reporter-service'];

services.forEach(function(service){
  let log  = fs.createWriteStream('./log/' + service + '.log');
  let proc = spawn('node', ['./services/' + service + '.js', '']);

  proc.stdout.pipe(log);
  proc.stderr.pipe(log);

  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
});
