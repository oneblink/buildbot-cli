'use strict';

const execa = require('execa');

const evergreen = require('../lib/evergreen.js');

const TYPES = ['cordova'];

module.exports = function (input, flags, options) {
  const projectPath = input[0] || process.cwd();

  if (TYPES.indexOf(flags.type) === -1) {
    console.error(`Error: unknown --type: "${flags.type}"`);
    return process.exit(1);
  }

  return Promise.resolve()
    .then(() => {
      console.info('running "cordova prepare", this may take a few seconds...');
      return execa('cordova', ['prepare'], { cwd: projectPath });
    })
    .catch((err) => {
      console.error(`Current working directory: ${projectPath}`);
      console.error(err.message);
      return process.exit(1);
    })
    .then(() => evergreen.findPlatforms(projectPath))
    .then((platforms) => {
      if (!platforms.length) {
        console.error('Error: prepared Cordova platforms not found');
        console.error('Please ensure "cordova prepare" has been run first');
        return process.exit(1);
      }
      return platforms;
    })
    .then((platforms) => {
      return evergreen.filterByExists(platforms.map((platform) => {
        return evergreen.getZipPath(projectPath, platform);
      }))
        .then((existingFiles) => {
          if (existingFiles.length && !flags.force) {
            console.error('Error: evergreen update ZIPs already exist in www/');
            console.error('Please remove them or use --force to overwrite');
            return process.exit(1);
          }
          return platforms;
        });
    })
    .then((platforms) => {
      // serially create evergreen update ZIPs
      console.log('creating evergreen update ZIPs...');
      // (prev: Promise, platform: String) => Promise
      return platforms.reduce((prev, platform) => {
        return prev.then(() => evergreen.zipPlatform(projectPath, platform))
          .then((zipPath) => console.log(`created: ${zipPath}`));
      }, Promise.resolve());
    });
};
