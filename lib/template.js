const { spawn } = require('child_process')
const path = require('path')
const chalk = require('chalk')
const ora = require('ora')
const spinner = ora('  Creating current project……\n')

function spawnDone(cliName, callback) {
  let errStr = ''

  spinner.start()
  cliName.on('close', function(code) {
    if (0 === Number(code)) {
      callback.apply(null, [code])
    } else {
      console.log(chalk.red(errStr))
    }
  })

  cliName.stderr.on('data', (data) => {
    errStr = data.toString()
  })
}

exports.clone = function(url, name, callback) {
  let curname = path.join(process.cwd(), name)
  return spawnDone(spawn('git', ['clone', url, curname]), function() {
    callback.apply(null, [spinner])
  })
}

Object.freeze(exports)