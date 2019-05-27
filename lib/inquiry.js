const inquirer = require('inquirer')

module.exports = async({ name }) => {
  let { isCreate } = await inquirer.prompt([{
    type: 'confirm',
    message: `Do you want to create "${name}" project`,
    name: 'isCreate',
    default: true
  }])

  if (!isCreate) { return new Promise(resolve => resolve({})) }

  let { tech, version, author } = await inquirer.prompt([{
    type: 'list',
    choices: ['vue', 'react', 'jquery-handlebars'],
    message: 'What kind of technology stack framework is used to develop?',
    name: 'tech'
  }, {
    message: 'Please enter the version number.',
    default: '0.0.0',
    name: 'version'
  }, {
    message: 'Please enter the name of the author.',
    default: 'anonymous',
    name: 'author'
  }])

  return await require(`../templates/${tech.toLowerCase()}`)({ name, version, author })
}
