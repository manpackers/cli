const path = require('path')
const fs = require('fs')

const spawn = require('cross-spawn')
const request = require('request')
const rimraf = require('rimraf')

const clone = (uri, name) => {
  spawn.sync('git', ['clone', uri, name])
  rimraf.sync(path.resolve(name, '.git'))
}

const install = name => spawn.sync('npm', [
  'i', '--prefix', path.resolve(name), '-f'
], { stdio: 'inherit' })

const version = async(url) => await new Promise(resolve => request(
  { url, timeout: 10000 }, (err, resp, body) => {
    if (err) {
      return resolve('^*')
    }

    if (resp && resp.statusCode === 200) {
      return resolve(`^${JSON.parse(body).collected.metadata.version}`)
    }
    return resolve('^*')
  }
))

const write = (file, str) => fs.writeFileSync(path.resolve(file), str)
module.exports = { clone, install, version, write }
