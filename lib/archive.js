'use strict'

const fs = require('fs')

const archiver = require('archiver')
const temp = require('temp')

const EXT = 'zip'

function zip (src, dest, options) {
  return new Promise((resolve, reject) => {
    let destPath
    let output
    if (dest && typeof dest === 'string') {
      destPath = dest
      output = fs.createWriteStream(dest)
    } else {
      // assume that dest is a temp stream
      destPath = dest.path
      output = dest
    }
    let archive = archiver.create(EXT, {})

    output.on('finish', () => resolve(destPath))
    output.on('error', (err) => reject(err))
    archive.on('error', (err) => reject(err))
    // disable the notification for now, but leave the code here because the
    // event could be useful for user feedback
    // archive.on('entry', data => console.log(`Added ${data.name} to archive`));

    archive.pipe(output)

    // archive.directory(src, '/').finalize();
    const globOptions = Object.assign({
      cwd: src,
      nodir: true
    }, options)
    archive.glob('**/*', globOptions).finalize()
  })
}

function archive (src, dest) {
  temp.track()
  let output = temp.createWriteStream({suffix: `.${EXT}`})

  console.log(`Compressing project in "${src}" before transfer`)
  return zip(src, output, {
    ignore: ['platforms/**', 'plugins/**']
  })
}

module.exports = {
  archive,
  zip
}
