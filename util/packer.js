const path = require('path')

const spawn = require('cross-spawn')
const request = require('request')

const clone = url => spawn.sync('git', ['clone', url], { stdio: 'inherit' })

const install = (url, dirName) => spawn.sync('npm', [
  'i', '--prefix', path.resolve(dirName), '-f'
], { stdio: 'inherit' })

const version = async(url) => await new Promise((resolve, reject) => request(
  { url, timeout: 10000 }, (err, resp, body) => {
    if (err) { return reject(err) }

    if (resp && resp.statusCode === 200) {
      return resolve(JSON.parse(body).collected.metadata.version)
    }
    return reject(err)
  }
))

module.exports = { clone, install, version }
