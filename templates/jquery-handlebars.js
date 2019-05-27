const Handlebars = require('handlebars')
const deepmerge = require('deepmerge')
const ora = require('ora')
const rimraf = require('rimraf')
const path = require('path')
const inquirer = require('inquirer')

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
  let packageJSON = Handlebars.compile(JSON.stringify(deepmerge(require('./template.json'), deepmerge({
    'scripts': {
      'server': 'manpacker server',
      'build': 'manpacker build'
    },

    'devDependencies': {
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
  }, isNode ? await require('./noden')() : {})), null, '  '))({ name, version, author })

  packer.clone(`${org}/jquery-handlebars.git`, name)
  isNode && rimraf.sync(path.resolve(`${name}/app`))
  packer.write(`${name}/package.json`, packageJSON)
  spinner.stop()
  packer.install(name)
  return packageJSON
}
