'use strict';

const execa = require('execa');

const evergreen = require('../lib/evergreen.js');
const cordovaProjectId = require('../lib/utils/cordova-project-id.js');

const TYPES = ['cordova'];

function execute (input, flags, options) {
  const projectPath = input[0] || process.cwd();

  if (TYPES.indexOf(flags.type) === -1) {
    return Promise.reject(new Error(`Unknown --type: "${flags.type}"`));
  }

  console.info('Running "cordova prepare", this may take a few seconds...');
  return execa('cordova', ['prepare'], { cwd: projectPath })
    .catch((err) => {
      console.log(`Current working directory: ${projectPath}`);
      return Promise.reject(err);
    })
    .then(() => evergreen.findPlatforms(projectPath))
    .then((platforms) => {
      if (!platforms.length) {
        return Promise.reject(new Error(`Prepared Cordova platforms not found
Please ensure platforms have been added using 'cordova platform add <platform> --save`));
      }
      return platforms;
    })
    .then((platforms) => {
      return evergreen.filterByExists(platforms.map((platform) => {
        return evergreen.getZipPath(projectPath, platform);
      }))
        .then((existingFiles) => {
          if (existingFiles.length && !flags.force) {
            return evergreen.confirm(existingFiles)
              .then((confirmation) => confirmation ? platforms : process.exit(0));
          }
          return platforms;
        });
    })
    .then((platforms) => {
      // serially create evergreen update ZIPs and upload if required
      console.log('Creating evergreen update ZIPs...');
      // (prev: Promise, platform: String) => Promise
      return platforms.reduce((prev, platform) => {
        return prev.then(() => evergreen.zipPlatform(projectPath, platform))
          .then((zipPath) => {
            console.log(`Created: ${zipPath}`);
            if (!flags.upload) {
              return zipPath;
            }
            return Promise.all([
              evergreen.getCurrentTenant(options.blinkMobileIdentity),
              cordovaProjectId(projectPath),
              evergreen.assumeAWSRole(options.blinkMobileIdentity)
            ])
              .then((results) => evergreen.upload(zipPath, results[0], results[1], results[2]))
              .then((location) => console.log(`Remote location: ${location}`))
              .catch((error) => Promise.reject(new Error(`An error occured while attempting to upload evergreen update ZIP: ${error.message}`)));
          });
      }, Promise.resolve());
    });
}

module.exports = function (input, flags, options) {
  return execute(input, flags, options)
    .catch(error => {
      console.error(`
There was a problem while attempting evergreen updates:

${error}

Please fix the error and try again.
`);
    });
};
