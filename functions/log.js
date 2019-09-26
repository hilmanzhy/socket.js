"use strict";

const vascommkit = require('vascommkit');

exports.find = function (APP, req, callback) {
	var params = APP.queries.select('log.mongo', req, APP.models);
	req.body.take = req.body.take ? req.body.take : 10;
	req.body.skip = req.body.skip ? req.body.skip : 0;

	APP.models.mongo.log.find(params).limit(req.body.take).skip(req.body.skip).sort({
		_id: -1
	}).lean().exec((err, rows) => {
	  if (err) return callback({
				code: 'ERR_DATABASE',
				data: JSON.stringify(err)
			});

		callback(null, {
			code: (rows && (rows.length > 0)) ? 'FOUND' : 'NOT_FOUND',
			data: rows,
			info: {
				dataCount: rows.length
			}
		});
	});

	return;
};

exports.insert = function (APP, req, callback) {
	req.body.date = vascommkit.time.date();
	req.body.time = vascommkit.time.time();
	var params = {};

	if (req.body.endpoint) {
		params = APP.queries.insert('log.mongo', req, APP.models);

		APP.models.mongo.log.create(params, (err, result) => {
			if (err) return callback({
				code: 'ERR_DATABASE',
				data: JSON.stringify(err)
			});
	
			return callback(null, {
				code: 'LOG_INSERT_SUCCESS',
				data: result
			});
		});
	}

	if (req.body.event) {
		params = req.body

		APP.models.mongo.log_socket.create(params, (err, result) => {
			
		})
	}
	
};

exports.delete = function (APP, req, callback) {
	var params = APP.queries.delete('log.mongo', req, APP.models);

	APP.models.mongo.log.remove(params, (err, result) => {
    if (err) return callback({
				code: 'ERR_DATABASE',
				data: JSON.stringify(err)
			});
    
    return callback(null, {
    	code: 'LOG_DELETE_SUCCESS',
    	data: result
    });
  });
};