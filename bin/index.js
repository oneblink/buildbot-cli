#!/usr/bin/env node
'use strict'

// foreign modules

const meow = require('meow')

// local modules

const main = require('..')
const help = require('../lib/help')

// this module

const cli = meow({
  help,
  flags: {
    'force': {
      type: 'boolean',
      default: false
    },
    'unset': {
      type: 'boolean'
    },
    'debug': {
      type: 'boolean',
      default: true
    },
    'release': {
      type: 'boolean',
      default: false
    },
    'upload': { // meow will also allow --no-upload from cmd line
      type: 'boolean',
      default: true
    },
    'platforms': {
      type: 'string'
    },
    'notify': {
      type: 'string'
    },
    'type': {
      type: 'string',
      default: 'cordova'
    }
  }
})

main(cli.input, cli.flags)
