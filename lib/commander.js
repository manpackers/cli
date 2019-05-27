const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const commander = require('commander')

const inquiry = require('./inquiry')

module.exports = class {
  constructor({ version }) {
    commander.version(version).usage('<command> [options]')
  }

  async create() {
    let { name } = await new Promise(resolve => commander.command('create <project-name>')
      .action(name => resolve({ name })))

    if (!fs.existsSync(path.resolve(name))) { return await inquiry({ name }) }
    console.warn(chalk.red(`${name} is exist`))
  }

  parse() {
    commander.parse(process.argv)
    return this
  }
}
