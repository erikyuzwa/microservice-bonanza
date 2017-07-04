#!/usr/bin/env node
'use strict';
const Fs = require('fs');
const Path = require('path');
const Spawn = require('child_process').spawn;

const services = ['collector-service', 'parser-service', 'persister-service', 'reporter-service'];

function mkdirIfNotExist(filepath) {

    const dirname = Path.dirname(filepath);
    if (!Fs.existsSync(dirname)) {
        Fs.mkdirSync(dirname);
    }
}

services.forEach((service) => {

    mkdirIfNotExist('./log/' + service + '.log');
    const log  = Fs.createWriteStream('./log/' + service + '.log');
    const proc = Spawn('node', ['./services/' + service + '.js', '']);

    proc.stdout.pipe(log);
    proc.stderr.pipe(log);

    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
});
