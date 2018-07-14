/* @flow */
'use strict'

/* ::
import type BlinkMobileIdentity, {
  AWSCredentials
} from '@blinkmobile/bm-identity'
*/

const request = require('request')

const constants = require('./constants.js')

function forBuild (
  accessToken /* : string | void */,
  analyticsParameters /* : { [key: string]: mixed } */
) /* : Promise<AWSCredentials> */ {
  return new Promise((resolve, reject) => {
    request(`${constants.SERVICE.origin}/buildbot/build-credentials`, {
      auth: {
        bearer: accessToken
      },
      json: true,
      qs: analyticsParameters
    }, (err, response, body) => {
      if (err) {
        return reject(err)
      }
      if (response.statusCode !== 200) {
        return reject(new Error(body && body.message ? body.message : 'Unknown error, please try again and contact support if the problem persists'))
      }
      return resolve(body)
    })
  })
    .then((body) => ({
      accessKeyId: body.Credentials.AccessKeyId,
      secretAccessKey: body.Credentials.SecretAccessKey,
      sessionToken: body.Credentials.SessionToken
    }))
}

module.exports = {
  forBuild
}
