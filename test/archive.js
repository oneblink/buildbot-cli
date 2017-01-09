'use strict';

const path = require('path');

const test = require('ava');
const temp = require('temp').track();
const yauzl = require('yauzl');

const archive = require('../lib/archive.js');

const SRC_PATH = path.join(__dirname, 'fixtures', 'evergreen', 'platforms', 'ios', 'www');

function listZipEntries (zipPath) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zip) => {
      if (err) {
        reject(err);
        return;
      }
      const entries = [];
      zip.on('error', (err) => reject(err));
      zip.on('end', () => resolve(entries));
      zip.on('entry', (entry) => {
        entries.push(entry.fileName);
        zip.readEntry();
      });
      zip.readEntry();
    });
  });
}

test('zip', (t) => {
  const tempZip = temp.createWriteStream({ suffix: '.zip' });
  return archive.zip(SRC_PATH, tempZip)
    .then(listZipEntries)
    // entries order is non-deterministic, so .sort()!
    // NOTE: .sort() mutates the array, but that doesn't matter here
    .then((entries) => t.deepEqual(entries.sort(), [
      'index.html',
      'js/main.js'
    ].sort()));
});
