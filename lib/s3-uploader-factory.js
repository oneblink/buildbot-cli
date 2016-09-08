'use strict';

const fs = require('fs');
const path = require('path');

const constants = require('./constants.js');
const AWSFactory = require('./aws-factory');

function upload (file, credentials) {
  return AWSFactory().then(aws => {
    credentials = credentials || {};
    const src = fs.createReadStream(file);
    const filename = path.basename(file);
    const s3 = new aws.S3(Object.assign({region: constants.BUILDBOT.REGION}, credentials));
    const params = {
      Bucket: constants.BUILDBOT.BUCKET_NAME,
      Key: filename,
      Body: src
    };

    const manager = s3.upload(params);
    manager.on('httpUploadProgress', progress => {
      const p = progress.loaded / progress.total * 100;
      if (p % 10 < 0.5) {
        console.log(`${p}%`);
      }
    });

    return manager;
  });
}

module.exports = upload;
