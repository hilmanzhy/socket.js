"use strict";

const sequelize = require('sequelize');

// Prevent columns from returned on "SELECT" query.
// Kolom-kolom yang tidak ingin ditampilkan saat return "SELECT".
exports.excludes = {
	test: [
		'id'
	],
	'test.mongo': [
		'id'
	],
	'log.mongo': [
		'_id'
	],
	'user.get': [
		'created_at',
		'updated_at',
		'password'
	],
	'device.get': [
		'created_at',
		'updated_at'
	]
};

// Query to insert data using Sequelize & Mongoose.
// Query untuk insert data dengan Sequelize & Mongoose.
exports.insert = function (model, req, models) {
	var query = {};

	switch (model) {
		// Sequelize (MySql) Example.
		case 'test':
			query = {
				name: req.body.name,
				value: req.body.value
			};
			
			return query;
			break;

		case 'user':
			query = {
				name: req.body.name,
				username: req.body.username,
				email: req.body.email,
				password: req.body.password,
				active_status: "1"
			}

			return query;
			break;

		// Mongoose (Mongo) Example.
		case 'test.mongo':
			query = {
				name: req.body.name,
				value: req.body.value
			};
			
			return query;
			break;

		case 'log.mongo':
			query = {
				endpoint: req.body.endpoint,
				request: req.body.request,
				response: req.body.response,
				status: req.body.status,
				date: req.body.date,
				time: req.body.time
			};
			
			return query;
			break;

		default:
			return {};
			break;
	}
};

// Query to get data using Sequelize & Mongoose.
// Query untuk mendapatkan data dengan Sequelize & Mongoose.
exports.select = function (model, req, models) {
	var query = {}
	query.where = {};
	query.limit = req.body.take ? req.body.take : 10;
	query.offset = req.body.skip ? req.body.skip : 0;
	query.order = [];
	query.attributes = {
		exclude: module.exports.excludes[model]
	};

	if (req.body.orderBy && !req.body.sort) query.order = [[req.body.orderBy, 'DESC']];
	if (!req.body.orderBy && req.body.sort) query.order = [['id', req.body.sort]];
	if (req.body.orderBy && req.body.sort) query.order = [[req.body.orderBy, req.body.sort]];
	if (req.body.id) query.where.id = req.body.id;
	if (req.body.groupBy) query.group = req.body.groupBy;

	switch (model) {
		// Sequelize (MySql) Example.
		case 'test':
			if (req.body.name) query.where.name = req.body.name;
			if (req.body.value) query.where.value = req.body.value;

			return query;
			break;

		// DEVICE
		case 'device_box_listrik':
			if (req.body.name) query.where.name = req.body.name;
			if (req.body.value) query.where.value = req.body.value;

			return query;
			break;
		
		// USER
		case 'user.get':
			if (req.body.username) query.where.username = req.body.username;

			return query;
			break;

		case 'user.registered':
			query.where = {
				[sequelize.Op.or]: [
					{ username: req.body.username },
					{ email: req.body.email }
				]
			}

			return query;
			break;

		// Mongoose (Mongo) Example.
		case 'test.mongo':
			query = {}; // Overwrite the 'query' variable.

			if (req.body._id) query._id = req.body._id;
			if (req.body.name) query.name = req.body.name;
			if (req.body.value) query.value = req.body.value;

			return query;
			break;

		case 'log.mongo':
			query = {}; // Overwrite the 'query' variable.

			if (req.body._id) query._id = req.body._id;
			if (req.body.endpoint) query.endpoint = req.body.endpoint;
			if (req.body.request) query.request = req.body.request;
			if (req.body.response) query.response = req.body.response;
			if (req.body.status) query.status = req.body.status;
			if (req.body.date) query.date = req.body.date;
			if (req.body.time) query.time = req.body.time;

			return query;
			break;

		default:
			return query;
			break;
	}
};

// Query to update data using Sequelize & Mongoose.
// Query untuk update data dengan Sequelize & Mongoose.
exports.update = function (model, req, models) {
	var params = {};
	params.dataUpdate = {};
	params.dataQuery = {};
	params.dataQuery.where = {};

	if (req.body.dataQuery.id) params.dataQuery.where.id = req.body.dataQuery.id;

	switch (model) {
		// Sequelize (MySql).
		case 'test':
			if (req.body.dataQuery.name) params.dataQuery.where.name = req.body.dataQuery.name;

			if (req.body.dataUpdate.name) params.dataUpdate.name = req.body.dataUpdate.name;

			return params;
			break;

		default:
			return params;
			break;
	}
};

// Query to delete data using Sequelize & Mongoose.
// Query untuk hapus data dengan Sequelize & Mongoose.
exports.delete = function (model, req, models) {
	var query = {};
	query.where = {};

	if (req.body.id) query.where.id = req.body.id;

	switch (model) {
		// Sequelize (MySql) Example.
		case 'test':
			if (req.body.name) query.where.name = req.body.name;

			return query;
			break;

		// Mongoose (Mongo) Example.
		case 'test.mongo':
			query.where = undefined; // Overwrite the 'query' variable.

			if (req.body._id) query._id = req.body._id;

			return query;
			break;

		case 'log.mongo':
			query.where = undefined; // Overwrite the 'query' variable.

			if (req.body._id) query._id = req.body._id;
			if (req.body.date) query.date = req.body.date;
			if (req.body.time) query.time = req.body.time;

			return query;
			break;

		default:
			return query;
			break;
	}
};