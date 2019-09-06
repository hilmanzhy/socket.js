const chalk = require('chalk'),
      vsckit  = require('vascommkit');
      
let templateLog = {
    header  : chalk.bold.blue('======================================================================'),
    footer  : chalk.bold.blue('======================================================================'),
    request : chalk.cyan('============================ REQUEST ================================='),
    response: chalk.cyan('============================ RESPONSE ================================'),
    time    : 'DATE      : ' + chalk.bold.yellow(vsckit.time.now())
}

console.log(templateLog.time)

module.exports = function (req, res) {
    // (req.message) ? templateLog.message = 'MESSAGE   : ' + chalk.bold.yellow(req.message) : '';

    templateLog.body =
        (req.level ?   'LEVEL     : ' + (req.level.error ? chalk.bold.red('ERROR') : chalk.bold.green('INFO')) + '\n' : '') +
        (req.info ?    'INFO      : ' + chalk.bold.yellow(req.info) + '\n' : '') +
        templateLog.time + '\n' +
        templateLog.request + '\n' +
        (req.body ? JSON.stringify(req.body) : chalk.grey('NULL')) + '\n' +
        templateLog.response + '\n' +
        (res ? ((typeof res == 'object') ? JSON.stringify(res) : res) : chalk.grey('NULL'))

    let template =
        templateLog.header + "\n" +
        templateLog.body + "\n" +
        templateLog.footer

    return template
}