"use strict";

const async = require('async');
const trycatch = require('trycatch');
const messages = require('../config/messages.json');
const log = require('../functions/log.js');
let output = {};

exports.print = function (req, res, params) {
	async.waterfall([
		function generateMessage (callback) {
			let message = {
				company: {}
			};

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