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
        'server': 'manpacker-vue server --ic ./config/localserver.ic.js',
        'dev': 'manpacker-vue build ./config/development.ic.js',
        'build': 'manpacker-vue build ./config/production.ic.js'
      },

      'devDependencies': {
        '@manpacker/generator-vue': await packer.version(
          `${npms}/${encodeURIComponent('@manpacker/generator-vue')}`
        ),
        'babel-preset-manpacker': await packer.version(
          `${npms}/babel-preset-manpacker`
        ),
        'eslint': '^5.16.0',
        'eslint-config-manpacker-vue': await packer.version(
          `${npms}/eslint-config-manpacker-vue`
        )
      },

      'babel': { 'presets': ['manpacker'] },

      'eslintConfig': {
        'extends': (isNode ? ['manpacker-typescript'] : []).concat(['manpacker-vue'])
      },

      dependencies: {
        'vue-router': await packer.version(`${npms}/vue-router`),
        'vuex': await packer.version(`${npms}/vuex`)
      }
    }, isNode ? await require('./noden')() : {})), null, '  '))({ name, version, author })

  packer.clone(`${org}/vue.git`, name)
  if (!isNode) {
    rimraf.sync(path.resolve(`${name}/app`))
    rimraf.sync(path.resolve(`${name}/tsconfig.json`))
  }
  packer.write(`${name}/package.json`, packageJSON)
  spinner.stop()
  packer.install(name)
  return packageJSON
}
