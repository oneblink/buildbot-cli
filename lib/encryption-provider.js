'use strict';

const crypto = require('crypto');
const AWSFactory = require('./aws-factory.js');

const privateVars = new WeakMap();

class EncryptionProvider {
  constructor (assumedRole) {
    privateVars.set(this, {
      assumedRole
    });
  }

  encrypt (secret) {
    return AWSFactory().then((AWS) => {
      return new Promise((resolve, reject) => {
        const KMS = new AWS.KMS(privateVars.get(this).assumedRole);
        const params = {
          KeyId: 'alias/buildbot-key',
          KeySpec: 'AES_256'
        };

        KMS.generateDataKey(params, (err, data) => {
          if (err) {
            return reject(err);
          }

          const cipher = crypto.createCipher('aes-256-cbc', data.Plaintext);
          let encrypted = cipher.update(secret, 'utf8', 'hex');
          encrypted += cipher.final('hex');
          delete data.Plaintext;
          resolve({encrypted, meta: data.CiphertextBlob});
        });
      });
    });
  }
}

module.exports = EncryptionProvider;
