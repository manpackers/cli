const inquirer = require('inquirer')
const Handlebars = require('handlebars')
const deepmerge = require('deepmerge')
const ora = require('ora')
const rimraf = require('rimraf')
const path = require('path')

const packer = require('../util/packer')
const npms = 'https://api.npms.io/v2/package'
const org = 'https://github.com/manpackers-template'

module.exports = async({ name, version, author }) => {
  let { isNode } = await inquirer.prompt([{
    type: 'confirm',
    message: 'Is it a node type project?',
    name: 'isNode',
    default: false
  }])

  let spinner = ora(`Initializing the ${name} project\n`).start()
  let packageJSON = Handlebars.compile(JSON.stringify(deepmerge(require('./template.json'), deepmerge({
    'scripts': {
      'server': 'manpacker-react server',
      'build': 'manpacker-react build'
    },

    'devDependencies': isNode ? {
      '@manpacker/noden': await packer.version(
        `${npms}/${encodeURIComponent('@manpacker/noden')}`
      ),
      '@manpacker/generator-react': await packer.version(
        `${npms}/${encodeURIComponent('@manpacker/generator-react')}`
      ),
      'babel-preset-manpacker-react': await packer.version(
        `${npms}/babel-preset-manpacker-react`
      ),
      'eslint': '^5.16.0',
      'eslint-config-manpacker-react': await packer.version(
        `${npms}/eslint-config-manpacker-react`
      ),
      'eslint-config-manpacker-typescript': await packer.version(
        `${npms}/eslint-config-manpacker-typescript`
      )
    } : {
      '@manpacker/generator-react': await packer.version(
        `${npms}/${encodeURIComponent('@manpacker/generator-react')}`
      ),
      'babel-preset-manpacker-react': await packer.version(
        `${npms}/babel-preset-manpacker-react`
      ),
      'eslint': '^5.16.0',
      'eslint-config-manpacker-react': await packer.version(
        `${npms}/eslint-config-manpacker-react`
      )
    },

    'babel': { 'presets': ['manpacker-react'] },

    'eslintConfig': { 'extends': ['manpacker-react'] },

    dependencies: {
      'react-router': await packer.version(`${npms}/react-router`),
      'redux': await packer.version(`${npms}/redux`),
      'react-redux': await packer.version(`${npms}/react-redux`)
    }
  }, isNode ? {
    'scripts': {
      'noden:server': 'manpacker-noden server&&nodemon --watch ./bin/www ./bin/www 9090',
      'noden:build': 'manpacker-noden build',
      'rese:build': 'npm run build&&npm run noden:build'
    },

    'eslintConfig': { 'extends': ['manpacker-typescript'] }
  } : {})), null, '  '))({ name, version, author })

  packer.clone(`${org}/react.git`, name)
  isNode && rimraf.sync(path.resolve(`${name}/app`))
  packer.write(`${name}/package.json`, packageJSON)
  spinner.stop()
  packer.install(name)
  return packageJSON
}
