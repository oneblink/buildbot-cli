'use strict'

const AWS = require('aws-sdk')
const constants = require('./constants.js')

function factory () {
  AWS.config.region = constants.BUILDBOT.REGION
  return Promise.resolve(AWS)
}

module.exports = factory
