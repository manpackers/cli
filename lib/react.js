const packer = require('../util/packer')
const npms = 'https://api.npms.io/v2/package'

module.exports = async({ isRouter = true, isRedux = true }) => {
  let gennerator = await packer.version(
    `${npms}/${encodeURIComponent('@manpacker/generator-react')}`
  )
  let babelReact = await packer.version(
    `${npms}/babel-preset-manpacker-react`
  )
  let eslintReact = await packer.version(
    `${npms}/eslint-config-manpacker-react`
  )
  let dependencies = {}

  if (isRouter) {
    dependencies['react-router'] = await packer.version(`${npms}/react-router`)
  }

  if (isRedux) {
    dependencies['redux'] = await packer.version(`${npms}/redux`)
    dependencies['react-redux'] = await packer.version(`${npms}/react-redux`)
  }

  return {
    'scripts': {
      'server': 'manpacker-react server',
      'build': 'manpacker-react build'
    },

    'devDependencies': {
      '@manpacker/gennerator-react': gennerator,
      'babel-preset-manpacker-react': babelReact,
      'eslint': '^5.16.0',
      'eslint-config-manpacker-react': eslintReact
    },

    dependencies
  }
}
