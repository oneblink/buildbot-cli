'use strict';

const fs = require('fs');
const logUpdate = require('log-update');
const elegantSpinner = require('elegant-spinner');

const constants = require('./constants.js');
const AWSFactory = require('./aws-factory');

function upload (bucket, key, file, credentials, publicRead) {
  return AWSFactory().then(aws => {
    credentials = credentials || {};
    const src = fs.createReadStream(file);
    const s3 = new aws.S3(Object.assign({region: constants.BUILDBOT.REGION}, credentials));
    const params = {
      Bucket: bucket,
      Key: key,
      Body: src
    };
    if (publicRead) {
      params.ACL = 'public-read';
    }

    const manager = s3.upload(params);
    let progress = 0;
    manager.on('httpUploadProgress', uploadProgress => {
      // Note that total may be undefined until the payload size is known.
      // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html
      if (uploadProgress.total) {
        progress = Math.floor(uploadProgress.loaded / uploadProgress.total * 100);
      }
    });

    const frame = elegantSpinner();
    const refreshIntervalId = setInterval(() => {
      logUpdate(`${frame()} Progress: ${progress}%`);
    }, 100);

    return new Promise((resolve, reject) => {
      manager.send((err, data) => {
        clearInterval(refreshIntervalId);
        logUpdate.clear();
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  });
}

module.exports = upload;
