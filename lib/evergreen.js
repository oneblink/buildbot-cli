'use strict';

const path = require('path');

const fs = require('@jokeyrhyme/pify-fs');
const memoize = require('lodash.memoize');
const inquirer = require('inquirer');
const chalk = require('chalk');

const zip = require('./archive.js').zip;
const constants = require('./constants.js');
const s3UploaderFactory = require('./s3-uploader-factory.js');
const BlinkMobileIdentity = require('@blinkmobile/bm-identity');
const pkg = require('../package.json');

const blinkMobileIdentity = new BlinkMobileIdentity(`${pkg.name}-evergreen`);

const DEFAULT_MAX_FILES = 2;
const PLATFORMS = {
  android: 'platforms/android/assets/www',
  ios: 'platforms/ios/www'
};

// `fs.access()` with boolean result, instead of rejection
// exists (filePath: String) => Promise<Boolean>
function exists (filePath) {
  return fs.access(filePath)
    .then(() => true)
    .catch(() => false);
}

// filterByExists (filePaths: String[]) => Promise<String[]>
function filterByExists (filePaths) {
  return Promise.all(
    filePaths
      // (filePath) => Promise<Boolean>
      .map((filePath) => exists(filePath))
  )
    // (results: Boolean[]) => Promise<String[]>
    .then((results) => filePaths.filter((filePath, index) => results[index]));
}

// getPlatformPath (projectPath: String, platform: String) => String
function getPlatformPath (projectPath, platform) {
  if (!PLATFORMS[platform]) {
    throw new Error(`unknown / unsupported platform: "${platform}"`);
  }
  return path.join(projectPath, PLATFORMS[platform]);
}

// similar to `filterByExists()`, but refactoring was too complex (try it)
// findPlatforms (projectPath) => Promise<String[]>
function findPlatforms (projectPath) {
  const platforms = Object.keys(PLATFORMS);
  return Promise.all(
    platforms
      // (platform) => Promise<Boolean>
      .map((platform) => exists(getPlatformPath(projectPath, platform)))
  )
    // (results: Boolean[]) => Promise<String[]>
    .then((results) => platforms.filter((platform, index) => results[index]));
}

// getZipPath (projectPath: String, platform: String) => String
function getZipPath (projectPath, platform) {
  return path.join(projectPath, `www-${platform}.zip`);
}

// zipPlatform (projectPath: String, platform: String) => Promise<String>
function zipPlatform (projectPath, platform) {
  const srcPath = getPlatformPath(projectPath, platform);
  const zipPath = getZipPath(projectPath, platform);
  return zip(srcPath, zipPath);
}

// assumeAWSRole () => Promise<Object>
function assumeAWSRole () {
  return blinkMobileIdentity.assumeAWSRole();
}

// assumeAWSRole () => Promise<String>
function getCurrentTenant () {
  return blinkMobileIdentity.getTenants()
    .then((tenants) => {
      if (!tenants || !tenants.current) {
        return Promise.reject(new Error('Current tenant is not set, please use \'bm identity tenant\' command to set a tenant before continuing.'));
      }
      return tenants.current;
    });
}

// upload (zipPath: String, tenant: String, project: String, credentials: Object) => Promise<String>
function upload (zipPath, tenant, project, credentials) {
  const fileName = path.basename(zipPath);
  const key = `${tenant}/${project}/${fileName}`;
  return s3UploaderFactory(constants.BUILDBOT.EVERGREEN_BUCKET_NAME, key, zipPath, credentials)
    .then(() => `https://evergreen.blinkm.io/${key}`);
}

function confirm (existingFiles, max) {
  if (!existingFiles || !existingFiles.length) {
    return Promise.resolve(true);
  }
  max = max || DEFAULT_MAX_FILES;
  console.log(chalk.gray('The following files will be overwritten:'));
  const moreThanMax = existingFiles.some((existingFile, index) => {
    const pastMax = index === max;
    if (!pastMax) {
      console.log(chalk.yellow(existingFile));
    }
    return pastMax;
  });
  if (moreThanMax) {
    console.log(chalk.gray(`Plus ${existingFiles.length - max} more...`));
  }
  const promptQuestions = [{
    type: 'confirm',
    name: 'confirmation',
    message: 'Would you like to continue: [Y]'
  }];
  return inquirer.prompt(promptQuestions)
    .then(results => results.confirmation);
}

module.exports = {
  filterByExists,
  findPlatforms,
  getPlatformPath,
  getZipPath,
  zipPlatform,
  assumeAWSRole: memoize(assumeAWSRole),
  getCurrentTenant: memoize(getCurrentTenant),
  upload: upload,
  confirm: confirm
};
