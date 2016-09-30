'use strict';

let constants = {};

constants.PLATFORMS = Object.freeze({
  WINDOWS: 'windows',
  ANDROID: 'android',
  IOS: 'ios'
});

constants.BUILD_MODES = Object.freeze({
  RELEASE: 'release',
  DEBUG: 'debug'
});

const buildbot = {
  REGION: 'ap-southeast-2',
  BUCKET_NAME: 'buildbot-storage.blinkm.io',
  EVERGREEN_BUCKET_NAME: 'io-blinkm-evergreen',
  DOMAIN: process.env.BUILDBOT_DOMAIN || 'BUILDBOT_DOMAIN',
  WORKFLOW_TYPES: Object.create(null),
  DECISION_TASKLIST: process.env.BUILDBOT_DECISIONS_TASKLIST || 'BUILDBOT_DECISIONS'
};

buildbot.WORKFLOW_TYPES[constants.PLATFORMS.WINDOWS] = {
  name: 'BUILDBOT_WORKFLOW_WINDOWS',
  version: '0.0.1'
};
buildbot.WORKFLOW_TYPES[constants.PLATFORMS.ANDROID] = {
  name: 'BUILDBOT_WORKFLOW_ANDROID',
  version: '0.0.1'
};
buildbot.WORKFLOW_TYPES[constants.PLATFORMS.IOS] = {
  name: 'BUILDBOT_WORKFLOW_IOS',
  version: '0.0.1'
};

constants.BUILDBOT = Object.freeze(buildbot);

module.exports = Object.freeze(constants);
