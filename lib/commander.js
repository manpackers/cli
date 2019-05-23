const path = require('path')
const fs = require('fs')

const commander = require('commander')
const chalk = require('chalk')
const Handlebars = require('handlebars')
const rimraf = require('rimraf')
const request = require('request')
const inquirer = require('inquirer')
const ora = require('ora')

const inquiry = require('../inquiry')
const template = require('../template')
const templateType = {
  webpack: ['base', 'jquery', 'vue', 'react',
    'article-base', 'article-animation'
  ],
  common: ['base', 'jquery', 'vue', 'react'],
  npm: ['base'],
  gulp: ['base']
}

//Init block
{
  program.usage('<project-name>')
    .parse(process.argv)

  if (program.args.length < 1) {
    program.help()
    return
  }
  inquirer.prompt([{
    type: 'list',
    name: 'type',
    choices: Object.keys(templateType),
    message: 'Please select develop project type: ',
    default: '0'
  }]).then(answer => {
    if (answer.type) {
      entryInitProject(answer.type)
    }
  })
}

function entryInitProject(tmpl) {
  inquiry({
    name: program.args[0],
    templateNames: templateType[tmpl].map(value => {
      return `${tmpl}-${value}`
    }),
    projectTypeNames: tool.projectTypeNames().split(','),
    platform: tool.platformNames().split(',')
  }, function(answer) {
    if (!answer.ok) {
      return
    }

    npmLatestVersion.apply(null, [answer])
  })
}

//Npm lasest version.
function npmLatestVersion(answer) {
  let spinner = ora('  Npm library authentication……\n').start()
  let npmName = answer.templateName.split('-')[0]

  answer.nodeNpmVersion = '0.0.1'

  if (npmName === 'gulp') {
    spinner.stop()
    gitRepoEntry(answer)
    return
  }
  request({
    url: 'https://api.npms.io/v2/package/%40manpacker%2Fgenerator-vue',
    timeout: 10000
  }, (err, res, body) => {
    spinner.stop()

    if (res && res.statusCode === 200) {
      answer.nodeNpmVersion = JSON.parse(body)['dist-tags'].latest
      spinner.stop()
      gitRepoEntry(answer)
    } else {
      console.log(chalk.red('Npm library authentication fail.'))
    }
  })
}

//Clone git repo for init project.
function gitRepoEntry(answer) {
  const GIT_REPO = '../gitrepo.json'
  let repo = {
    git: 'https://api.npms.io/v2/package/%40manpacker%2Fgenerator-vue'
  }

  //Set git repo.
  if (fs.existsSync(path.join(__dirname, GIT_REPO))) {
    repo.git = require(GIT_REPO).git
  }

  repo.git = repo.git.replace('{{template}}', answer.templateName)

  if (fs.existsSync(path.resolve(process.cwd(), program.args[0]))) {
    console.log(chalk.red('The project or directory already exists.'))
    return
  }

  template.clone(repo.git, program.args[0], function(spinner) {
    rimraf(path.resolve(
      process.cwd(), program.args[0], '.git'
    ), function(err) {
      if (err) {
        spinner.stop()
        throw err
      }
      templateInfo.apply(null, [answer, spinner])
    })
  })
}

//Set template information data.
function templateInfo(answer, spinner) {
  let file = path.resolve(process.cwd(), program.args[0], 'package.json')
  let readStream = fs.createReadStream(file)

  readStream.on('data', function(data) {
    fs.createWriteStream(file).write(
      Handlebars.compile(data.toString())(answer),
      function() {
        spinner.stop()
        console.log(chalk.green(`Creat project\'s ${program.args[0]} success \n`))
        console.log(chalk.yellow(`Command tips: cd ${program.args[0]} &  npm i \n`))
      })
  })
}