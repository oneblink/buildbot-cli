'use strict'

const path = require('path')

const chalk = require('chalk')
const temp = require('temp')
const isValidEmail = require('valid-email')

const constants = require('../lib/constants.js')
const archive = require('../lib/archive.js').archive
const s3UploaderFactory = require('../lib/s3-uploader-factory.js')
const validator = require('../lib/buildfile-validator.js')
const startWorkflow = require('../lib/start-workflow.js')
const emailConfig = require('../lib/user-email.js')
const CertificatePasswords = require('../lib/certificate-passwords.js')
const pluginHelper = require('../lib/plugin-helper.js')
const cordovaProjectId = require('../lib/utils/cordova-project-id.js')

function upload (src, credentials) {
  return archive(src)
    .then(archive => {
      console.log('Transferring project')
      return s3UploaderFactory(constants.BUILDBOT.BUCKET_NAME, path.basename(archive), archive, credentials)
    })
    .then(data => {
      temp.cleanup()
      return data.Key
    })
}

const go = (platforms, userEmail, file, assumedRole, passwordsByPlatform, buildMode) => {
  console.log('Attempting to start buildbot process' + (platforms.length > 1 ? 'es' : ''))
  return Promise.all(platforms.map(platform => {
    const signingInfo = passwordsByPlatform.get(platform)
    return startWorkflow({
      file,
      assumedRole,
      signingInfo,
      platform,
      userEmail,
      buildMode
    }).then(() => console.log(`Buildbot process has been started for platform: ${platform}`))
  })).then(() => console.log(`Notifications will be sent to: ${userEmail}`))
}

function build (input, flags, options) {
  if (!flags.platforms) {
    return Promise.reject(new Error('Must supply the --platforms flag with a comma seperated list of platforms. E.g. --platforms android,ios,windows'))
  }
  const src = input[0] || process.cwd()
  let buildMode = constants.BUILD_MODES.DEBUG
  // Leaving buildMode flag in for backward compatibility
  if (flags.buildMode) {
    console.log(`
'--buildMode' flag has been deprecated and will be removed in a future release.
Please use the '--release' and '--debug' flags instead.
`)
    buildMode = flags.buildMode
  } else if (flags.release) {
    buildMode = constants.BUILD_MODES.RELEASE
  }
  const platforms = flags.platforms.split(',').map((p) => p.trim())

  // Before we start the buildbot process, will need to do the following:
  // (Will do the local validation before attempting AWS functions)
  // 1. Validate build.json and config.xml
  // 2. Validate email address for notifications
  // 3. Validate cordova plugins
  // 4. Get AWS credientials to:
  //  a. Use encyption key for passwords
  //  b. Upload project to s3
  //  c. Start AWS simple workflow

  return Promise.all([
    validator(path.join(src, 'build.json'), platforms, buildMode),
    cordovaProjectId(src)
  ]).then((results) => {
    let email = flags.notify
    let emailPrompt
    const project = results[1]

    if (!email) {
      // if no email has been specified, read it from user config.
      // if no user config entry, prompt for an email and save the value
      emailPrompt = () => emailConfig.askIfNotSet()
    } else {
      if (!isValidEmail(email)) {
        return Promise.reject(new Error(`Email address "${email}" is invalid.`))
      }
      // if an email has been specified, check for an entry in the user config
      // if nothing is found, save the email to global config
      emailPrompt = () => emailConfig.writeIfNotSet(email)
    }
    return emailPrompt().then((promptResults) => {
      email = email || promptResults
      return pluginHelper(src)
        .then(() => options.blinkMobileIdentity.assumeAWSRole({
          bmProject: project,
          command: 'build',
          platforms
        }))
        .then((assumedRole) => {
          const passwords = new CertificatePasswords(platforms, buildMode, assumedRole)
          return passwords.get()
            .then((passwordsByPlatform) => upload(src, assumedRole).then((file) => go(platforms, email, file, assumedRole, passwordsByPlatform, buildMode)))
        })
    })
  })
}

module.exports = function (input, flags, options) {
  return build(input, flags, options).catch((err) => {
    console.error(`
There was a problem preparing your project:

${chalk.red(err)}

Please fix the error and try again.
`)
    process.exitCode = 1
  })
}
