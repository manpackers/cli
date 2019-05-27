const inquirer = require('inquirer')
const Handlebars = require('handlebars')
const deepmerge = require('deepmerge')
const ora = require('ora')
const rimraf = require('rimraf')
const path = require('path')

const packer = require('../util/packer')
const { npms, org } = require('../util/uri')

module.exports = async({ name, version, author }) => {
  let { isNode } = await inquirer.prompt([{
    type: 'confirm',
    message: 'Is it a node type project?',
    name: 'isNode',
    default: false
  }])

  let spinner = ora(`Initializing the ${name} project\n`).start()
  let packageJSON = Handlebars.compile(JSON.stringify(
    deepmerge(require('./template.json'), deepmerge({
      'scripts': {
        'start': 'npm run server',
        'server': 'manpacker-react server --ic ./config/localserver.ic.js',
        'dev': 'manpacker-react build ./config/development.ic.js',
        'build': 'manpacker-react build ./config/production.ic.js'
      },

      'devDependencies': {
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

      'eslintConfig': {
        'extends': (isNode ? ['manpacker-typescript'] : []).concat(['manpacker-react'])
      },

      dependencies: {
        'react-router': await packer.version(`${npms}/react-router`),
        'redux': await packer.version(`${npms}/redux`),
        'react-redux': await packer.version(`${npms}/react-redux`)
      }
    }, isNode ? await require('./noden')() : {})), null, '  '))({ name, version, author })

  packer.clone(`${org}/react.git`, name)
  if (!isNode) {
    rimraf.sync(path.resolve(`${name}/app`))
    rimraf.sync(path.resolve(`${name}/tsconfig.json`))
  }
  packer.write(`${name}/package.json`, packageJSON)
  spinner.stop()
  packer.install(name)
  return packageJSON
}
