"use strict";

const environment = require('./app.json').env;

require('env2')('.env.' + environment);

const events = require('events');

events.EventEmitter.prototype._maxListeners = 100;
events.EventEmitter.defaultMaxListeners = 100;

const fs = require('fs');
const async = require('async');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const trycatch = require('trycatch');
const path = require('path');
const vascommkit = require('vascommkit');
const ip = require('ip');
const chalk = require('chalk')

const output = require('./functions/output.js');
const db = require('./config/db.js');
const model = require('./config/model.js');
const queries = require('./functions/queries.js');
const validation = require('./functions/validation.js');
const whitelist = require('./whitelist.json');
const request = require('./functions/request.js');
const templates = require('./functions/templates.js');
const encryption = require('./functions/encryption.js');

const cronjob = require('./controllers/cronjobController.js');

const app = express();

app.use(bodyParser.json({limit: process.env.JSON_LIMIT}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan(process.env.LOG_ENV));

app.use((req, res, next) => {
	async.waterfall([
		function initializeBaseAPP (callback) {
			req.customDate = new Date();
			req.customTime = vascommkit.time.time();
			req.APP = {};
			req.APP.db = db;
			req.APP.output = output;
			req.APP.queries = queries;
			req.APP.validation = validation;
			req.APP.request = request;
			req.APP.templates = templates;
			req.APP.encryption = encryption;

			callback(null, true);
		},
		function initializeModels (index, callback) {
			model(db, (err, result) => {
				if (err) return callback(err);

				req.APP.models = result;

				callback(null, true);
			});
		}
	], (err, result) => {
		if (err) return output.print(req, res, {
				code: 'GENERAL_ERR'
			});

		return next();
	});
});

app.all('/', (req, res, next) => {
	return output.print(req, res, {
		code: 'SERVICE_NOT_FOUND'
	});
});

/* Middleware Auth */
app.use((req, res, next) => {
/* 	const actionBy = (req.body && req.body.action_by) ? req.body.action_by : process.env.SERVICE_NAME;
	const ipAddress = (req.body && req.body.ip_address) ? req.body.ip_address : ip.address();

	if (whitelist.front.indexOf(req.originalUrl) >= 0) {
		req.body = req.body || {};
	} else {
		req.body = (req.body && req.body.data) ? req.body.data : {};
	}

	req.body.action_by = actionBy;
	req.body.ip_address = ipAddress; */

	var session = require('./functions/session.js'),
		encryption = require('./functions/encryption.js')

	if (req.body.data) {
		let decrypted = encryption.decryptRSA(req.body.data)

		req.body = decrypted
		req.encrypted = true
	}

	if (req.query) req.queryUrl = req.originalUrl.split('?')

	if (whitelist.indexOf(req.originalUrl) >= 0) {
		return next();
	} else if (req.queryUrl && whitelist.indexOf(req.queryUrl[0]) >= 0) {
		return next();
	} else if (req.get('session-key') && req.get('session-key') == 'device' ) {
		return next();
	} else {
		session.check(req.APP, req, (err, result) => {
			if (err) {
				return output.print(req, res, {
					code: err.code
				})
			}
			if (result) {
				req.auth = result
				
				return next();
			}
		})
	}
});

fs.readdir('./routes', (err, files) => {
	var len = files.length;
	var lenX = len - 1;
	var n = 0;

	files.map(route => {
		if (route.match('.js')) {
			app.use('/' + route.replace('.js', ''), require('./routes/' + route));

			if (n === lenX) {
				app.use((req, res, next) => {
					return output.print(req, res, {
						code: 'SERVICE_NOT_FOUND'
					});
				});

				app.listen(process.env.PORT, () => {
					var cron = cronjob();
					
					return console.log(chalk.bold.green('\n' +
						'          ((\n' +
						'         ((((       ((((\n' +
						'         ((((  (((  ((((\n' +
						'     #   (((((((((  ((((\n' +
						'    (((( ((((  (((  ((//  ///\n' +
						'(((((((( ((((  ((/  //////////////////\n') +
						chalk.bold.blue(
						'    (((( ((((  ///  //// (///\n' +
						'    ((((/////  /////////  ///\n' +
						'         ////  ///  ////\n' +
						'         ////  ///  ////\n' +
						'         ////        //*\n') +
						chalk.green(
						"     _    _                     _\n" + 
						" ___<_> _| |_ ___ ._ _ _  ___ _| |_ ___\n" + 
						"<_-<| |  | | <_> || ' ' |/ . \\ | | / . \\\n" +
						"/__/|_|  |_| <___||_|_|_|\\___/ |_| \\___/\n") + '\n' +
						chalk.blue(`////// CORE RUNNING ON PORT:${process.env.PORT} //////`) + '\n'
					);
				});
			}
		}

		n++;
	});
});

/* ------------------------------------------------------------------------------------------ */
/* ----------------------------------- TESTING SECTION -------------------------------------- */
/* ------------------------------------------------------------------------------------------ */