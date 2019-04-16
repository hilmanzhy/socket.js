"use strict";

const async = require('async');
const md5 = require('md5');
const unirest = require('unirest');
const request = require('../functions/request.js');

var query = {};

exports.mysqlGet = function (APP, req, callback) {
	var params = APP.queries.select('test', req, APP.models);

	APP.models.mysql.test.findAll(params).then((rows) => {
		return callback(null, {
			code: (rows && (rows.length > 0)) ? 'FOUND' : 'NOT_FOUND',
			data: rows,
			info: {
				dataCount: rows.length
			}
		});
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
};

exports.mongoGet = function (APP, req, callback) {
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
};

exports.setlumensensor = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device

	console.log(`========== PARAMS ==========`)
	console.log(params)

	if(!params.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!params.id_device) return callback({ code: 'MISSING_KEY' })
	if(!params.device_ip) return callback({ code: 'MISSING_KEY' })
	if(!params.lumensensor_on) return callback({ code: 'MISSING_KEY' })
	if(!params.lumensensor_off) return callback({ code: 'MISSING_KEY' })
	
	query.value = {
		lumensensor_on : params.lumensensor_on,
		lumensensor_off : params.lumensensor_off
	}
	query.options = {
		where : {
			device_id : params.id_device,
			user_id : params.id_akun,
			device_ip : params.device_ip
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) {
			Device.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== RESULT ==========`)
				console.log(resUpdate)
				
				return callback(null, {
					code : 'OK',
					message : 'Set Lumen Sensor Value Success and Saved'
				});
			});
		} else {
			return callback(null, {
				code : 'NOT_FOUND',
				message : 'Device Not Found'
			});
		}
    }).catch((err) => {
        return callback({
            code: 'ERR_DATABASE',
            data: JSON.stringify(err)
        });
    });
};

exports.setall = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device

	console.log(`========== PARAMS ==========`)
	console.log(params)

	if(!params.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!params.lumensensor_on) return callback({ code: 'MISSING_KEY' })
	if(!params.lumensensor_off) return callback({ code: 'MISSING_KEY' })
	
	query.value = {
		lumensensor_on : params.lumensensor_on,
		lumensensor_off : params.lumensensor_off
	}
	query.options = {
		where : {
			user_id : params.id_akun
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) {
			Device.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== RESULT ==========`)
				console.log(resUpdate)
				
				return callback(null, {
					code : 'OK',
					message : 'Set Lumen Sensor Value Success and Saved on All Devices'
				});
			});
		} else {
			return callback(null, {
				code : 'NOT_FOUND',
				message : 'Device Not Found'
			});
		}
    }).catch((err) => {
        return callback({
            code: 'ERR_DATABASE',
            data: JSON.stringify(err)
        });
    });
};

exports.switchlumensensor = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device

	console.log(`========== PARAMS ==========`)
	console.log(params)
	
	if(!params.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!params.id_device) return callback({ code: 'MISSING_KEY' })
	if(!params.device_ip) return callback({ code: 'MISSING_KEY' })
	if(!params.lumensensor_status) return callback({ code: 'MISSING_KEY' })

	query.value = {
		lumensensor_status : params.lumensensor_status
	}
	query.options = {
		where : {
			device_id : params.id_device,
			user_id : params.id_akun,
			device_ip : params.device_ip
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) {
			Device.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== RESULT ==========`)
				console.log(resUpdate)
				
				return callback(null, {
					code : 'OK',
					message : 'Switch Lumen Sensor Success'
				});
			});
		} else {
			return callback(null, {
				code : 'NOT_FOUND',
				message : 'Device Not Found'
			});
		}
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
};

exports.removelumensensor = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device

	console.log(`========== PARAMS ==========`)
	console.log(params)
	
	if(!params.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!params.id_device) return callback({ code: 'MISSING_KEY' })
	if(!params.device_ip) return callback({ code: 'MISSING_KEY' })

	query.value = {
		lumensensor_on : null,
		lumensensor_off : null,
		lumensensor_status : 0
	}
	query.options = {
		where : {
			device_id : params.id_device,
			user_id : params.id_akun,
			device_ip : params.device_ip
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) {
			Device.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== RESULT ==========`)
				console.log(resUpdate)
				
				return callback(null, {
					code : 'OK',
					message : 'Remove Lumen Sensor Value Success and Saved'
				});
			});
		} else {
			return callback(null, {
				code : 'NOT_FOUND',
				message : 'Device Not Found'
			});
		}
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
};

exports.removeall = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device

	console.log(`========== PARAMS ==========`)
	console.log(params)
	
	if(!params.id_akun) return callback({ code: 'MISSING_KEY' })

	query.value = {
		lumensensor_on : null,
		lumensensor_off : null,
		lumensensor_status : 0
	}
	query.options = {
		where : {
			user_id : params.id_akun
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) {
			Device.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== RESULT ==========`)
				console.log(resUpdate)

				query.value = {
					lumensensor_status : 0
				}
				query.options = {
					where : {
						user_id : params.id_akun
					}
				}

				Device.update(query.value, query.options).then((resUpdate) => {
					console.log(`========== RESULT ==========`)
					console.log(resUpdate)
					
					return callback(null, {
						code : 'OK',
						message : 'Remove Lumen Sensor Value on All Devices Success and Saved'
					});
				});
				
			});
		} else {
			return callback(null, {
				code : 'NOT_FOUND',
				message : 'Device Not Found'
			});
		}
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
};

exports.lumensensordata = function (APP, req, callback) {
	const datareq = req.body
	const Device = APP.models.mysql.device

	console.log(`========== PARAMS ==========`)
	console.log(datareq)
	
	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.sensorvalue) return callback({ code: 'MISSING_KEY' })

    query.where = { 
		user_id : datareq.id_akun,
		device_id : datareq.id_device
	}
	query.attributes = { exclude: ['created_at', 'updated_at'] }

	Device.findOne(query).then((result) => {
		
        console.log(`========== RESULT ==========`)
        const element = result
        console.log(element.nama_device)
        console.log(element.device_ip)
        console.log(element.tipe_device)
        console.log(element.lumensensor_on)
		console.log(element.lumensensor_off)
		console.log(element.lumensensor_status)

		if (element.lumensensor_status == '1')
		{
			var mode = ""
			if (element.tipe_device == '1')
			{
				mode = '1'
			}
			else
			{
				mode = '0'
            }
        	console.log(mode)

        	if (element.lumensensor_on > datareq.sensorvalue)
        	{
				console.log("nyala")
				var params = {
					"id_akun": datareq.id_akun,
					"id_device": datareq.id_device,
					"device_ip": element.device_ip,
					"nama_device": element.nama_device,
					"status": "1",
					"type": element.tipe_device,
					"pin": "0",
					"mode": mode
				}
				console.log(params)
				var url = `http://localhost:${process.env.PORT}/device/command`

				console.log("hit device command")
				request.post(url, params, (err, result) => {
					if (err) {
						
					}
					return callback(null, {
						code : 'OK'
					});
				})
        	}
        	else if(element.lumensensor_off < datareq.sensorvalue)
        	{
				console.log("mati")
				var params = {
					"id_akun": datareq.id_akun,
					"id_device": datareq.id_device,
					"device_ip": element.device_ip,
					"nama_device": element.nama_device,
					"status": "0",
					"type": element.tipe_device,
					"pin": "0",
					"mode": mode
				}
				console.log(params)
				var url = `http://localhost:${process.env.PORT}/device/command`

				console.log("hit device command")
				request.post(url, params, (err, result) => {
					if (err) {
						
					}
					return callback(null, {
						code : 'OK'
					});
				})
        	}
        	else
        	{
				return callback(null, {
					code : 'OK'
				});
        	}
		}
		else
		{
			return callback(null, {
				code : 'OK',
				message : 'Lumen Sensor Status OFF'
			});
		}
			
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
};