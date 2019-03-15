"use strict";

module.exports = {
	registration: {
		success: {
			email: {
				text: function (params) {
					return 'Hello ' + params.name;
				},
				html: function (params) {
					return '<h1>Hello ' + params.name + '</h1>';
				}
			},
			sms: {
				text: function (params) {
					return 'Hello ' + params.name;
				}
			}
		},
		failed: {
			email: {
				text: function (params) {
					return 'Failed ' + params.name;
				},
				html: function (params) {
					return '<h1>Failed ' + params.name + '</h1>';
				}
			},
			sms: {
				text: function (params) {
					return 'Failed ' + params.name;
				}
			}
		}
	},

	// Default format example.
	example: {
		success: {
			email: {
				text: function () {
					return 'Hello World';
				},
				html: function () {
					return '<h1>Hello World</h1>';
				}
			},
			sms: {
				text: function () {
					return 'Hello World';
				}
			}
		},
		failed: {
			email: {
				text: function () {
					return 'Failed';
				},
				html: function () {
					return '<h1>Failed</h1>';
				}
			},
			sms: {
				text: function () {
					return 'Failed';
				}
			}
		}
	}
};