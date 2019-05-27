const inquirer = require('inquirer')
const Handlebars = require('handlebars')
const deepmerge = require('deepmerge')
const ora = require('ora')

const packer = require('../util/packer')
const npms = 'https://api.npms.io/v2/package'
const org = 'https://github.com/manpackers-template'

module.exports = async({ name, version, author }) => {
  let { isRouterAndRedux } = await inquirer.prompt([{
    type: 'confirm',
    message: 'Do you want to use "router" and "redux?',
    name: 'isRouterAndRedux',
    default: false
  }])

  // eslint-disable-next-line
  console.log('\n')
  let spinner = ora(`Initializing the ${name} project\n`).start()
  let gennerator = await packer.version(
    `${npms}/${encodeURIComponent('@manpacker/generator-react')}`
  )
  let babel = await packer.version(
    `${npms}/babel-preset-manpacker-react`
  )
  let eslint = await packer.version(
    `${npms}/eslint-config-manpacker-react`
  )
  let dependencies = {}
  let gitURI = `${org}/react.git`
  let packageJSON

  if (isRouterAndRedux) {
    dependencies['react-router'] = await packer.version(`${npms}/react-router`)
    dependencies['redux'] = await packer.version(`${npms}/redux`)
    dependencies['react-redux'] = await packer.version(`${npms}/react-redux`)
    gitURI = `${org}/react-router-redux.git`
  }

  packageJSON = Handlebars.compile(JSON.stringify(deepmerge(require('./template.json'), {
    'scripts': {
      'server': 'manpacker-react server',
      'build': 'manpacker-react build'
    },

    'devDependencies': {
      '@manpacker/generator-react': gennerator,
      'babel-preset-manpacker-react': babel,
      'eslint': '^5.16.0',
      'eslint-config-manpacker-react': eslint
    },

    'babel': { 'presets': ['manpacker-react'] },

    'eslintConfig': { 'extends': ['manpacker-react'] },

    dependencies
  }), null, '  '))({ name, version, author })

  packer.clone(gitURI, name)
  packer.write(`${name}/package.json`, packageJSON)
  spinner.stop()
  packer.install(name)
  return packageJSON
}
