'use strict';

const fs = require('fs');
const path = require('path');

const xml2js = require('xml2js');

function cordovaConfig (directory, callback) {
  const cfgPath = path.join(directory, 'config.xml');
  fs.access(cfgPath, (err) => {
    if (err) {
      return callback(new Error('config.xml not found'));
    }

    fs.readFile(cfgPath, 'utf8', (err, xml) => {
      if (err) {
        return callback(new Error('Could not read config.xml'));
      }

      const parser = new xml2js.Parser();
      parser.parseString(xml, callback);
    });
  });
}

module.exports = cordovaConfig;
