"use strict";

const async = require('async'),
	  chalk = require('chalk'),
	  trycatch = require('trycatch'),
	  vascommkit = require('vascommkit'),
	  messages = require('../config/messages.json'),
	  log = require('../functions/log.js');

let output = {},
	templateLog = {
		header  : chalk.bold.blue('======================================================================'),
		footer  : chalk.bold.blue('======================================================================'),
		request : chalk.cyan('============================ REQUEST ================================='),
		response: chalk.cyan('============================ RESPONSE ================================'),
		message : chalk.cyan('============================ MESSAGE ================================='),
		time    : 'DATETIME  : ' + chalk.bold.yellow(vascommkit.time.now())
	}

exports.print = function (req, res, params) {
	async.waterfall([
		function generateMessage (callback) {
			let ipAddress = req.get('x-forwarded-for') || req.connection.remoteAddress,
				message = { company: {} };
			
			if (ipAddress.substr(0, 7) == "::ffff:") {
				ipAddress = ipAddress.substr(7)
			}

			if (messages[params.code]) message.company = messages[params.code];

			output.code = message.company.code || params.code;
			output.message = params.message || message.company.message;
			output.data = params.data || message.company.data;
			output.debug = undefined;

			// if (process.env.NODE_ENV !== 'production') {
			// 	if (message.company.error === true || (!message.company.code && params.code !== '00')) {
			// 		output.debug = {
			// 			from: (params.from || process.env.SERVICE_NAME) || message.company.from,
			// 			status: params.status || message.company.status,
			// 			name: params.name || message.company.name,
			// 			info: params.info || message.company.info
			// 		};
			// 	}
			// }

			console.log(chalk.bold.blue('======================================================================')+'\n'+
					'LEVEL     : '+(message.company.error ? chalk.bold.red('ERROR') : chalk.bold.green('INFO')) +'\n'+
					'IP        : '+chalk.bold.yellow(ipAddress)+'\n'+
					'ENDPOINT  : '+chalk.bold.yellow(req.originalUrl)+'\n'+
					'DATE      : '+chalk.bold.yellow(vascommkit.time.now())+'\n'+
					chalk.cyan('============================ REQUEST =================================')+'\n'+
					JSON.stringify(req.body)+'\n'+
					chalk.cyan('============================ RESPONSE ================================')+'\n'+
					JSON.stringify(output)+'\n'+
					chalk.bold.blue('======================================================================'))

			callback(null, message);
		},
		function logging (message, callback) {
			log.insert(req.APP, {
				body: {
					request: req.body ? req.body : null,
					response: output ? output : null,
					status: message.company.status || 200,
					endpoint: req.originalUrl,
					date: req.customDate,
					time: req.customTime
				}
			}, (err, result) => {
				callback(null, message);
			});
		}
	], (err, message) => {
		trycatch(() => {
			output.data.ip_address = undefined;
			output.data.action_by = undefined;
			
			return res.status(message.company.status || 200).json(output);
		}, () => {
			return res.status(message.company.status || 200).json(output);
		});
	});
};

exports.insert = function (req, res, params) {
	let body = {
		request: req.body ? req.body : null,
		response: res ? res : null,
		date: req.customDate,
		time: req.customTime
	}

	if (req.originalUrl) body.endpoint = req.originalUrl
	if (req.event) body.event = req.event

	log.insert(req.APP, { body }, (err, result) => {
		if (result) return this.log(params, res)
	});
};

exports.log = function (req, res) {
    templateLog.body =
        (req.level ?		'LEVEL     : ' + (req.level.error ? chalk.bold.red('ERROR') : chalk.bold.green('INFO')) : '') +
        (req.ip ?			'\nIP        : ' + chalk.bold.yellow(req.ip) : '') +
        (req.originalUrl ?	'\nENDPOINT  : ' + chalk.bold.yellow(req.originalUrl) : '') +
        (req.info ?			'\nINFO      : ' + chalk.bold.yellow(req.info) : '') +
        '\n' + templateLog.time +
        (req.body ? '\n' + templateLog.request : '') +
        (req.body ? '\n' + JSON.stringify(req.body) : '') +
        (res ? '\n' + templateLog.response : '') +
		(res ? '\n' + ((typeof res == 'object') ? JSON.stringify(res) : res) : '') +
		(req.message ? '\n' + templateLog.message : '') +
        (req.message ? '\n' + req.message : '')

    let template =
        templateLog.header + '\n' +
        templateLog.body + '\n' +
        templateLog.footer + '\n'

    return console.log(template)
};