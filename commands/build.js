'use strict';
const path = require('path');

const temp = require('temp');
const isValidEmail = require('valid-email');

const constants = require('../lib/constants.js');
const archive = require('../lib/archive.js').archive;
const s3UploaderFactory = require('../lib/s3-uploader-factory.js');
const validator = require('../lib/buildfile-validator.js');
const startWorkflow = require('../lib/start-workflow.js');
const emailConfig = require('../lib/user-email.js');
const CertificatePasswords = require('../lib/certificate-passwords.js');
const pluginHelper = require('../lib/plugin-helper.js');

function upload (src, credentials) {
  return archive(src)
    .then(archive => s3UploaderFactory(archive, credentials))
    .then(uploader => {
      return new Promise((resolve, reject) => {
        console.log('Transferring project');
        uploader.send((err, data) => {
          if (err) {
            return reject(err);
          }
          temp.cleanup();
          resolve(data.Key);
        });
      });
    });
}

const go = (platforms, userEmail, file, assumedRole, passwordsByPlatform, buildMode) => {
  console.log('Attempting to start buildbot process' + platforms.length > 1 ? 'es' : '');
  return Promise.all(platforms.map(platform => {
    const signingInfo = passwordsByPlatform.get(platform);
    return startWorkflow({
      file,
      assumedRole,
      signingInfo,
      platform,
      userEmail,
      buildMode
    });
  }));
};

function build (input, flags, options) {
  if (!flags.platforms) {
    return Promise.reject('Must supply the --platforms flag with a comma seperated list of platforms. E.g. --platforms android,ios,windows');
  }
  const src = input[0] || process.cwd();
  const buildMode = flags.buildMode || constants.BUILD_MODES.DEBUG;
  const platforms = flags.platforms.split(',').map((p) => p.trim());

  // Before we start the buildbot process, will need to do the following:
  // (Will do the local validation before attempting AWS functions)
  // 1. Validate build.json
  // 2. Validate email address for notifications
  // 3. Validate cordova plugins
  // 4. Get AWS credientials to:
  //  a. Use encyption key for passwords
  //  b. Upload project to s3
  //  c. Start AWS simple workflow

  return validator(path.join(src, 'build.json'), platforms, buildMode).then(() => {
    let email = flags.notify;
    let emailPrompt;

    if (!email) {
      // if no email has been specified, read it from user config.
      // if no user config entry, prompt for an email and save the value
      emailPrompt = () => emailConfig.askIfNotSet();
    } else {
      if (!isValidEmail(email)) {
        return Promise.reject(`Email address "${email}" is invalid.`);
      }
      // if an email has been specified, check for an entry in the user config
      // if nothing is found, save the email to global config
      emailPrompt = () => emailConfig.writeIfNotSet(email);
    }
    return emailPrompt().then((promptResults) => {
      email = email || promptResults;
      return pluginHelper(src).then(() => {
        return options.blinkMobileIdentity.assumeAWSRole().then((assumedRole) => {
          const passwords = new CertificatePasswords(platforms, buildMode, assumedRole);
          return passwords.get().then((passwordsByPlatform) => {
            return upload(src, assumedRole).then((file) => go(platforms, email, file, assumedRole, passwordsByPlatform, buildMode));
          });
        });
      });
    });
  });
}

module.exports = function (input, flags, options) {
  return build(input, flags, options).catch((err) => {
    console.log(`
There was a problem preparing your project:

${err}

Please fix the error and try again.
`);

    process.exit(1);
  });
};
