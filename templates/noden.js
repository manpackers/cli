const packer = require('../util/packer')
const { npms } = require('../util/uri')

module.exports = async() => ({
  'devDependencies': {
    '@manpacker/noden': await packer.version(
      `${npms}/${encodeURIComponent('@manpacker/noden')}`
    ),
    'eslint-config-manpacker-typescript': await packer.version(
      `${npms}/eslint-config-manpacker-typescript`
    ),
    'nodemon': '^1.19.0'
  },

  'scripts': {
    'noden:server': 'manpacker-noden server&&nodemon --watch ./bin/www ./bin/www 9090',
    'noden:build': 'manpacker-noden build',
    'reses:build': 'npm run build&&npm run noden:build'
  }
})
