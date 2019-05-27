const Handlebars = require('handlebars')
const deepmerge = require('deepmerge')
const ora = require('ora')
const rimraf = require('rimraf')
const path = require('path')
const inquirer = require('inquirer')

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
      'server': 'manpacker server',
      'build': 'manpacker build'
    },

    'devDependencies': isNode ? {
      '@manpacker/noden': await packer.version(
        `${npms}/${encodeURIComponent('@manpacker/noden')}`
      ),
      '@manpacker/generator': await packer.version(
        `${npms}/${encodeURIComponent('@manpacker/generator')}`
      ),
      'babel-preset-manpacker': await packer.version(
        `${npms}/babel-preset-manpacker`
      ),
      'eslint': '^5.16.0',
      'eslint-config-manpacker': await packer.version(
        `${npms}/eslint-config-manpacker`
      ),
      'eslint-config-manpacker-typescript': await packer.version(
        `${npms}/eslint-config-manpacker-typescript`
      )
    } : {
      '@manpacker/generator': await packer.version(
        `${npms}/${encodeURIComponent('@manpacker/generator')}`
      ),
      'babel-preset-manpacker': await packer.version(
        `${npms}/babel-preset-manpacker`
      ),
      'eslint': '^5.16.0',
      'eslint-config-manpacker': await packer.version(
        `${npms}/eslint-config-manpacker`
      )
    },

    'babel': { 'presets': ['manpacker'] },

    'eslintConfig': { 'extends': ['manpacker'] },

    dependencies: {
      jquery: await packer.version(`${npms}/jquery`),
      handlebars: await packer.version(`${npms}/handlebars`)
    }
  }, isNode ? {
    'scripts': {
      'noden:server': 'manpacker-noden server&&nodemon --watch ./bin/www ./bin/www 9090',
      'noden:build': 'manpacker-noden build',
      'rese:build': 'npm run build&&npm run noden:build'
    },

    'eslintConfig': { 'extends': ['manpacker-typescript'] }
  } : {})), null, '  '))({ name, version, author })

  packer.clone(`${org}/jquery-handlebars.git`, name)
  isNode && rimraf.sync(path.resolve(`${name}/app`))
  packer.write(`${name}/package.json`, packageJSON)
  spinner.stop()
  packer.install(name)
  return packageJSON
}
