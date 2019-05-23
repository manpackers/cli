const inquirer = require('inquirer')

const createProject = async ({
  name = '',
  version = '0.0.0',
  author = 'anonymous'
}) => await inquirer.prompt([{
  type: 'input',
  name: 'name',
  message: 'Input your project name by default: ',
  default: name
}, {
  type: 'input',
  name: 'version',
  message: 'Input the project version by default: ',
  default: version
}, {
  type: 'input',
  name: 'author',
  message: 'Input the author\'s name by default: ',
  default: author
}, {
  type: 'confirm',
  name: 'ok',
  message: `Make sure to create ${name} project`,
  default: 'Y'
}])

module.exports = { createProject }