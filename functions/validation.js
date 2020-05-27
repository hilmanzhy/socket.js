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
	return (!str || str == '' || str.length < 6 || (str && typeof str !== 'string'))
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

exports.date = (date) => moment(date).isValid();
