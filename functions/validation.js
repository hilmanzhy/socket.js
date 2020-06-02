"use strict";

const moment = require('moment');

exports.username = function (str) {
	return (!str || str == '' || str.length < 4 || typeof str !== 'string' || / /g.test(str) || str.length > 20)
		? {
			code: 'INVALID_REQUEST',
			data: {
				invalid_parameter: 'username'
			}
		} : true;
};

exports.email = function (str) {
	return (!str || str == '' || str.length < 5 || typeof str !== 'string' || !/^(([^<>()[\].,;:\s@"]+(.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i.test(str) || str.length > 80)
		? {
			code: 'INVALID_REQUEST',
			data: {
				invalid_parameter: 'email'
			}
		} : true;
};

exports.password = function (str) {
	return (!str || str == '' || str.length < 6 || (str && typeof str !== 'string') || / /g.test(str) || str.length > 20)
		? {
			code: 'INVALID_REQUEST',
			data: {
				invalid_parameter: 'password'
			}
		} : true;
};

exports.name = function (str) {

	return (!str || str == '' || str.length < 6 || (str && typeof str !== 'string') )
		? {
			code: 'INVALID_REQUEST',
			data: {
				invalid_parameter: 'name'
			}
		} : true;
};

exports.phone = function (str) {
	return (!str || str == '' || str.length < 10 || (str && typeof str !== 'string'))
		? {
			code: 'INVALID_REQUEST',
			data: {
				invalid_parameter: 'phone'
			}
		} : true;
};

exports.number = (str) => isNaN(str) ? false : true;

exports.date = (str) => moment(str).isValid();

exports.device_id = (str) =>
    (str && typeof str !== "string") ||
	// Below regex only accept Letters and Numbers
    /[^A-Za-z0-9-_\s]/.test(str)
        ? false
		: true;
		
exports.device_name = (str) =>
	(str && typeof str !== "string") ||
	// Below regex only accept Letters and Numbers with whitespaces
    /[^A-Za-z0-9\s]/.test(str)
        ? false
		: true;
		
exports.ip_address = (str) =>
	// Below regex only accept valid format IP Address
	!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(str)
		? false
		: true;

exports.pin = (str) => (str.length > 2 || isNaN(str) ? false : true);