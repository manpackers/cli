const Handlebars = require('handlebars')
const deepmerge = require('deepmerge')
const ora = require('ora')

const packer = require('../util/packer')
const npms = 'https://api.npms.io/v2/package'
const org = 'https://github.com/manpackers-template'

module.exports = async({ name, version, author }) => {
  // eslint-disable-next-line
  console.log('\n')
  let spinner = ora(`Initializing the ${name} project\n`).start()
  let gennerator = await packer.version(
    `${npms}/${encodeURIComponent('@manpacker/generator')}`
  )
  let babel = await packer.version(
    `${npms}/babel-preset-manpacker`
  )
  let eslint = await packer.version(
    `${npms}/eslint-config-manpacker`
  )
  let jquery = await packer.version(`${npms}/jquery`)
  let handlebars = await packer.version(`${npms}/handlebars`)
  let gitURI = `${org}/jquery-handlebars.git`
  let packageJSON

  packageJSON = Handlebars.compile(JSON.stringify(deepmerge(require('./template.json'), {
    'scripts': {
      'server': 'manpacker server',
      'build': 'manpacker build'
    },

    'devDependencies': {
      '@manpacker/generator': gennerator,
      'babel-preset-manpacker': babel,
      'eslint': '^5.16.0',
      'eslint-config-manpacker': eslint
    },

    'babel': { 'presets': ['manpacker'] },

    'eslintConfig': { 'extends': ['manpacker'] },

    dependencies: { jquery, handlebars }
  }), null, '  '))({ name, version, author })

  packer.clone(gitURI, name)
  packer.write(`${name}/package.json`, packageJSON)
  spinner.stop()
  packer.install(name)
  return packageJSON
}
