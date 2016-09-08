'use strict';

const path = require('path');

const fs = require('@jokeyrhyme/pify-fs');

const zip = require('./archive.js').zip;

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
  return path.join(projectPath, 'www', `www-${platform}.zip`);
}

// zipPlatform (projectPath: String, platform: String) => Promise<String>
function zipPlatform (projectPath, platform) {
  const srcPath = getPlatformPath(projectPath, platform);
  const zipPath = getZipPath(projectPath, platform);
  return zip(srcPath, zipPath);
}

module.exports = {
  filterByExists,
  findPlatforms,
  getPlatformPath,
  getZipPath,
  zipPlatform
};
