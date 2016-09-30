#! /usr/bin/env node
'use strict';

// foreign modules

const meow = require('meow');

// local modules

const main = require('..');
const help = require('../lib/help');

// this module

const cli = meow({
  help,
  version: true
}, {
  boolean: [
    'force',
    'unset',
    'debug',
    'release',
    'upload' // meow will also allow --no-upload from cmd line
  ],
  default: {
    debug: true,
    release: false,
    force: false,
    upload: true,
    type: 'cordova'
  },
  string: [
    'platforms',
    'notify',
    'type'
  ]
});

main(cli.input, cli.flags);
