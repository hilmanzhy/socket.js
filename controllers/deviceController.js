"use strict";

const async = require('async');
const md5 = require('md5');
const unirest = require('unirest');
const sequelize = require('sequelize');
const io = require('socket.io-client');

const request = require('../functions/request.js');

var socket = io(`http://localhost:${process.env.SOCKET_PORT}`);
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

exports.registerdevice = function (APP, req, callback) {
	
	var datareq = req.body
	var response = {}
	const Device = APP.models.mysql.device

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_ip) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_name) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	query.options = {
		where : {
			device_id : datareq.device_id,
			user_id : datareq.user_id
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) 
		{
			return callback(null, {
				code : 'ERR_DUPLICATE',
				message : 'Device ID already exists'
			});
			
		} 
		else 
		{
			/* if (datareq.device_type == '0')
			{
				console.log("insert device");
				APP.models.mysql.device.create({
					device_id: datareq.device_id,
					user_id: datareq.user_id,
					device_ip: datareq.device_ip,		
					device_status: '0',
					device_name: datareq.device_name,
					install_date: date,
					switch: '0',
					number_of_pin : datareq.pin,
					device_type: datareq.device_type
			
				}).then((rows) => {

					APP.db.sequelize.query("select device_key from users where user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.SELECT})

					.then((device) => {
						console.log(device[0].device_key)

						var unirest = require('unirest');
						var connectdev = "Device ID " + datareq.device_id + " : " + datareq.device_name + " sudah terkoneksi dengan sistem"
						console.log(connectdev)

						var notif = {
							"to": device[0].device_key,
							"notification": 
								{
									"title": "Sitamoto",
									"body": connectdev
								},
							"data": 
								{
									"id": "1",
									"command": "1"
								}
						}
						
						console.log("sendnotif")
						unirest.post('https://fcm.googleapis.com/fcm/send')
							.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'key=AAAApNlKMJk:APA91bH2y94mcN6soiTrMJzZf7t52eiR4cRfUdoNA7lIeCWU_BkzGHApidOHIK5IHfIH_80v_BJ8JfJXPvi1xIUJZjptYKQ56Qu8wxojxDlNxeMbj9SVRm6jwBUjGhQRcskAbLqfcqPZ'})
							.send(notif)
							.end(function (response) {
								console.log(response.body);
								
							});

						response = {
							code : 'OK',
							error : 'false',
							message : 'Data saved'
						}
						return callback(null, response);

					}).catch((err) => {
						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);
					});

				}).catch((err) => {
					console.log(err)

					APP.db.sequelize.query("select device_key from users where user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.SELECT})

					.then((device) => {
						console.log(device[0].device_key)
					
						var unirest = require('unirest');
						var connectdev = "Device ID " + datareq.device_id + " : " + datareq.device_name + " gagal terkoneksi dengan sistem, mohon coba lagi"
						console.log(connectdev)

						var notif = {
							"to": device[0].device_key,
							"notification": 
								{
									"title": "Sitamoto",
									"body": connectdev
								},
							"data": 
								{
									"id": "1",
									"command": "1"
								}
						}
						
						console.log("sendnotif")
						unirest.post('https://fcm.googleapis.com/fcm/send')
							.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'key=AAAApNlKMJk:APA91bH2y94mcN6soiTrMJzZf7t52eiR4cRfUdoNA7lIeCWU_BkzGHApidOHIK5IHfIH_80v_BJ8JfJXPvi1xIUJZjptYKQ56Qu8wxojxDlNxeMbj9SVRm6jwBUjGhQRcskAbLqfcqPZ'})
							.send(notif)
							.end(function (response) {
								console.log(response.body);
								
							});

						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);

					}).catch((err) => {
						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);
					});
				});
			}
			else
			{ */
			if (datareq.device_type == '0' && datareq.pin != '1')
			{
				response = {
					code : 'ERR_DATABASE',
					message : 'Wrong number of pin on mini device'
				}
				return callback(null, response);
			}
			else
			{
				console.log("insert device");
				APP.db.sequelize.query('CALL sitadev_iot_2.create_devicepin (:device_id, :device_ip, :user_id, :device_name, :date, :pin, :group_id, :device_type)',
					{ 
						replacements: {
							device_id: datareq.device_id,
							user_id: datareq.user_id,
							device_ip: datareq.device_ip,
							device_name: datareq.device_name,
							date: date,
							pin : datareq.pin,
							group_id : "null",
							device_type : datareq.device_type
						}, 
						type: APP.db.sequelize.QueryTypes.RAW 
					}

				).then((rows) => {

					APP.db.sequelize.query("select device_key from users where user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.SELECT})

					.then((device) => {
						console.log(device[0].device_key)

						var unirest = require('unirest');
						var connectdev = "Device ID " + datareq.device_id + " : " + datareq.device_name + " sudah terkoneksi dengan sistem"
						console.log(connectdev)

						var notif = {
							"to": device[0].device_key,
							"notification": 
								{
									"title": "Sitamoto",
									"body": connectdev
								},
							"data": 
								{
									"id": "1",
									"command": "1"
								}
						}
						
						console.log("sendnotif")
						unirest.post('https://fcm.googleapis.com/fcm/send')
							.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'key=AAAApNlKMJk:APA91bH2y94mcN6soiTrMJzZf7t52eiR4cRfUdoNA7lIeCWU_BkzGHApidOHIK5IHfIH_80v_BJ8JfJXPvi1xIUJZjptYKQ56Qu8wxojxDlNxeMbj9SVRm6jwBUjGhQRcskAbLqfcqPZ'})
							.send(notif)
							.end(function (response) {
								console.log(response.body);
								
							});
					
						response = {
							code : 'OK',
							error : 'false',
							message : 'Data saved'
						}
						return callback(null, response);

					}).catch((err) => {
						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);
					});

				}).catch((err) => {
					console.log(err)

					APP.db.sequelize.query("select device_key from users where user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.SELECT})

					.then((device) => {
						console.log(device[0].device_key)
						
						var unirest = require('unirest');
						var connectdev = "Device ID " + datareq.device_id + " : " + datareq.device_name + " gagal terkoneksi dengan sistem, mohon coba lagi"
						console.log(connectdev)

						var notif = {
							"to": device[0].device_key,
							"notification": 
								{
									"title": "Sitamoto",
									"body": connectdev
								},
							"data": 
								{
									"id": "1",
									"command": "1"
								}
						}
						
						console.log("sendnotif")
						unirest.post('https://fcm.googleapis.com/fcm/send')
							.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'key=AAAApNlKMJk:APA91bH2y94mcN6soiTrMJzZf7t52eiR4cRfUdoNA7lIeCWU_BkzGHApidOHIK5IHfIH_80v_BJ8JfJXPvi1xIUJZjptYKQ56Qu8wxojxDlNxeMbj9SVRm6jwBUjGhQRcskAbLqfcqPZ'})
							.send(notif)
							.end(function (response) {
								console.log(response.body);
								
							});

						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);

					}).catch((err) => {
						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);
					});
				});
			}
		}
		//}
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});

};

exports.getdevice = function (APP, req, callback) {
    const params = req.body
    const Device = APP.models.mysql.device
    
    if(!params.user_id) return callback({ code: 'MISSING_KEY' })
    
    query.where = { user_id : params.user_id }
		query.attributes = { exclude: ['created_at', 'updated_at'] }
    
    Device.findAll(query).then((result) => {
		return callback(null, {
			code : (result && (result.length > 0)) ? 'FOUND' : 'NOT_FOUND',
			data : result
		});

	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
};

exports.getpindevice = function (APP, req, callback) {

	var datareq = req.body
	var response = {}
	const Device = APP.models.mysql.device_pin

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	query.where = { user_id : datareq.user_id, device_id : datareq.device_id}
	query.attributes = { exclude: ['created_at', 'updated_at'] }
    
  	Device.findAll(query).then((result) => {
		return callback(null, {
			code : (result && (result.length > 0)) ? 'FOUND' : 'NOT_FOUND',
			data : result
		});

	}).catch((err) => {
		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
	});
	
};

exports.activatedevice = function (APP, req, callback) {

	var datareq = req.body
	var response = {}
	const Device = APP.models.mysql.device
	const Devicepin = APP.models.mysql.device_pin

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	query.options = {
		where : {
			device_id : datareq.device_id,
			user_id : datareq.user_id
		}
	}
	
	Device.findAll(query.options).then((result) => {
		if (result.length > 0) 
		{
			if (datareq.device_type == '0')
			{
				console.log("activate device");
				APP.db.sequelize.query("update device set device_status = 1, active_date = now() where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
				
				.then(device => {

					console.log("res")
					response = {
						code : 'OK',
						error : 'false',
						message : 'Activate success'
					}
					return callback(null, response);
				
				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
				});
			}
			else
			{
				query.options = {
					where : {
						device_id : datareq.device_id,
						user_id : datareq.user_id,
						pin : datareq.pin
					}
				}

				Devicepin.findAll(query.options).then((result) => {
					if (result.length > 0) 
					{
						console.log("activate device");
						APP.db.sequelize.query("update device_pin set device_status = 1, active_date = now() where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "' and pin = '" + datareq.pin + "'", { type: APP.db.sequelize.QueryTypes.RAW})
					
						.then(device => {

							console.log("res")
							response = {
								code : 'OK',
								error : 'false',
								message : 'Activate success'
							}
							return callback(null, response);
						
						}).catch((err) => {
							response = {
								code: 'ERR_DATABASE',
								data: JSON.stringify(err)
							}
							return callback(response);
						});
					} 
					else 
					{
						return callback(null, {
							code : 'NOT_FOUND',
							message : 'Device Pin Not Found'
						});
					}
				}).catch((err) => {
					return callback({
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					});
				});
			}
		} 
		else 
		{
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

exports.deactivatedevice = function (APP, req, callback) {

	var datareq = req.body
	var response = {}
	const Device = APP.models.mysql.device
	const Devicepin = APP.models.mysql.device_pin

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	query.options = {
		where : {
			device_id : datareq.device_id,
			user_id : datareq.user_id
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) 
		{
			if (datareq.device_type == '0')
			{
				console.log("deactivate device");
				APP.db.sequelize.query("update device set device_status = 0, active_date = NULL where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
				
				.then(device => {

					console.log("res")
					response = {
						code : 'OK',
						error : 'false',
						message : 'Deactivate success'
					}
					return callback(null, response);
				
				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
				});
			}
			else
			{
				query.options = {
					where : {
						device_id : datareq.device_id,
						user_id : datareq.user_id,
						pin : datareq.pin
					}
				}

				Devicepin.findAll(query.options).then((result) => {
					if (result.length > 0) 
					{
						console.log("deactivate device");
						APP.db.sequelize.query("update device_pin set device_status = 0, active_date = NULL where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "' and pin = '" + datareq.pin + "'", { type: APP.db.sequelize.QueryTypes.RAW})
					
						.then(device => {

							console.log("res")
							response = {
								code : 'OK',
								error : 'false',
								message : 'Deactivate success'
							}
							return callback(null, response);
						
						}).catch((err) => {
							response = {
								code: 'ERR_DATABASE',
								data: JSON.stringify(err)
							}
							return callback(response);
						});
					} 
					else 
					{
						return callback(null, {
							code : 'NOT_FOUND',
							message : 'Device Pin Not Found'
						});
					}
				}).catch((err) => {
					return callback({
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					});
				});
			}
		} 
		else 
		{
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

exports.registerkeyword = function (APP, req, callback) {
	
	var params = APP.queries.select('device_detail_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq)
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	APP.models.mysql.device_detail_listrik.create({
        device_id: datareq.device_id,
		keyword: datareq.keyword,
		id_pin: datareq.id_pin,		        
		tanggal: date
    }).then((rows) => {
		return callback(null, {
			code : '00',
			error : 'false',
			message : 'Data saved'
		});
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
	
};

exports.getid = function (APP, req, callback) {
	
	var params = APP.queries.select('device_detail_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.device_id)
	console.log(datareq.keyword)
	
	APP.db.sequelize.query("select id_pin from device_detail_listrik where device_id = '" + datareq.device_id + "' and keyword = '" + datareq.keyword + "'", { type: APP.db.sequelize.QueryTypes.SELECT})
	.then(device => {
		console.log(device)
		return callback(null, {
			code : '00',
			error : 'false',
			message : 'Data Found',
			data : device
		});
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
	
};

exports.devicedetail = function (APP, req, callback) {
	
	var datareq = req.body
	var response = {}
	const Device = APP.models.mysql.device

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	query.where = { 
		user_id : datareq.user_id,
		device_id : datareq.device_id,
	}
	query.attributes = { exclude: ['created_at', 'updated_at'] }

	Device.findAll(query).then(device => {
		console.log(device)
		
		return callback(null, {
			code : (device && (device.length > 0)) ? 'FOUND' : 'NOT_FOUND',
			data : device
		});

	}).catch((err) => {
		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
	});
	
};

exports.pindetail = function (APP, req, callback) {
	
	var datareq = req.body
	var response = {}
	const Device = APP.models.mysql.device_pin

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	query.where = { 
		user_id : datareq.user_id,
		device_id : datareq.device_id,
		pin : datareq.pin
	}
	query.attributes = { exclude: ['created_at', 'updated_at'] }
	
	Device.findAll(query).then(device => {
		console.log(device)
		
		return callback(null, {
			code : (device && (device.length > 0)) ? 'FOUND' : 'NOT_FOUND',
			data : device
		});

	}).catch((err) => {
		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
	});
	
};

exports.updatename = function (APP, req, callback) {
	var datareq = req.body,
		response = {}, Device;

	if (!datareq.user_id) return callback({
		code: 'MISSING_KEY', data: {
			invalid_parameter: 'user_id'
		}
	})
	if (!datareq.device_id) return callback({
		code: 'MISSING_KEY', data: {
			invalid_parameter: 'device_id'
		}
	})
	if (!datareq.type) return callback({
		code: 'MISSING_KEY', data: {
			invalid_parameter: 'type'
		}
	})
	if (!datareq.pin) return callback({
		code: 'MISSING_KEY', data: {
			invalid_parameter: 'pin'
		}
	})
	if (!datareq.device_name) return callback({
		code: 'MISSING_KEY', data: {
			invalid_parameter: 'device_name'
		}
	})
	if (!datareq.icon_id) return callback({
		code: 'MISSING_KEY', data: {
			invalid_parameter: 'icon_id'
		}
	})

	var date = new Date();
	date.setHours(date.getHours());

	console.log(datareq)
	console.log(date);

	query = {
		options: {
			where: {
				device_id: datareq.device_id,
				user_id: datareq.user_id
			}
		},
		update: {
			device_name: datareq.device_name,
			icon_id: datareq.icon_id
		}
	}
	output.data = {
		device_id: datareq.device_id,
		device_name: datareq.device_name,
		user_id: datareq.user_id,
		icon_id: datareq.icon_id
	}

	switch (datareq.type) {
		case '0':
			Device = APP.models.mysql.device

			break;

		case '1':
			Device = APP.models.mysql.device_pin
			query.options.where.pin = datareq.pin
			output.data.pin = datareq.pin

			break;
	}

	Device.findOne(query.options).then(result => {
		if (result) {
			Device.update(query.update, query.options).then(updated => {
				return callback(null, {
					code: 'OK',
					error: 'false',
					message: 'Update success',
					data: output.data
				})
			})
		} else {
			return callback(null, {
				code: 'NOT_FOUND',
				message: 'Device Not Found'
			});
		}
	}).catch(err => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	})

	socket.emit('update-pin', { device_id: datareq.device_id })
};

exports.deletedevice = function (APP, req, callback) {
	
	var datareq = req.body
	var response = {}
	const Device = APP.models.mysql.device

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	//if(!datareq.device_type) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	query.options = {
		where : {
			device_id : datareq.device_id,
			user_id : datareq.user_id
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) 
		{
			/* if (datareq.device_type == '0')
			{
				APP.db.sequelize.query("delete from device where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
			
				.then(device => {
					console.log("delete device")

					response = {
						code : 'OK',
						error : 'false',
						message : 'Delete success'
					}
					return callback(null, response);
					
				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
				});
			}
			else
			{ */
				APP.db.sequelize.query("delete from device where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
			
				.then(device => {
					console.log("delete device")

					APP.db.sequelize.query("delete from device_pin where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
			
					.then(device => {
						console.log("delete pin")

						response = {
							code : 'OK',
							message : 'Delete device ' + datareq.device_id +  ' success'
						}
						return callback(null, response);
						
					}).catch((err) => {
						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);
					});
					
				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
				});
			//}
		} 
		else 
		{
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

exports.devicehistory = function (APP, req, callback) {
	
	var datareq = req.body
	var response = {}
	console.log(datareq)
	const DeviceHistory = APP.models.mysql.device_history

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })

	query.options = {
		attributes : { exclude: ['created_at', 'updated_at'] },
		where : {
			user_id : datareq.user_id,
			date: {
				[APP.db.Sequelize.Op.between]: [datareq.date_from, `${datareq.date_to} 23:59:59`]
			  }
		},
		raw : true
	}

	if (datareq.device_id) query.options.where.device_id = datareq.device_id
	if (datareq.pin) query.options.where.pin = datareq.pin
	
	// var query = "select device_id, device_ip, IFNULL(pin,'-') as pin, device_name, device_type, switch, date from device_history where user_id = '" + datareq.user_id + "' and date > '" + datareq.date_from + "' and date < '" + datareq.date_to + "'"

	// if (datareq.device_id != '')
	// {
	// 	query = query + " and device_id = '" + datareq.device_id + "'"
	// }

	// if (datareq.pin != '')
	// {
	// 	query = query + " and pin = '" + datareq.pin + "'"
	// }
	
	// APP.db.sequelize.query(query, { type: APP.db.sequelize.QueryTypes.SELECT})
	
	// .then(device => {

	DeviceHistory.findAll(query.options).then((device) => {
		response = {
			code : (device && (device.length > 0)) ? 'FOUND' : 'NOT_FOUND',
			data : device
		}
		return callback(null, response);

	}).catch((err) => {
		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
	});
	
};

exports.commandpanel = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}
	const Device = APP.models.mysql.device
	const Devicepin = APP.models.mysql.device_pin

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.switch) return callback({ code: 'MISSING_KEY' })
	if(!datareq.mode) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date) return callback({ code: 'MISSING_KEY' })

	query.where = {
		device_id : datareq.device_id,
		user_id : datareq.user_id
	}
	query.attributes = { exclude: ['created_at', 'updated_at'] }

	Device.findAll(query).then(device => {
		if (device.length > 0) 
		{
			console.log(device[0].device_ip)
			console.log(device[0].device_name)
			console.log(device[0].device_type)
			console.log(device[0].is_connected)

			var device_ip = device[0].device_ip
			var device_type = device[0].device_type
			var device_name = device[0].device_name

			if (device[0].is_connected == '1')
			{
				if (datareq.mode == '2')
				{
					console.log('execute pin device')

					query.where = {
						device_id : datareq.device_id,
						user_id : datareq.user_id,
						pin : datareq.pin
					}
					query.attributes = { exclude: ['created_at', 'updated_at'] }

					Devicepin.findAll(query).then((result) => {
						if (result.length > 0) 
						{
							console.log(result[0].device_ip)
							console.log(result[0].device_name)

							if (result[0].device_name == null)
							{
								var pindevicename = '-'
							}
							else
							{
								var pindevicename = result[0].device_name
							}

							APP.db.sequelize.query("update device_pin set switch = '" + datareq.switch + "' where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "' and pin = '" + datareq.pin + "'", { type: APP.db.sequelize.QueryTypes.RAW})
						
							.then(device => {

								console.log("add to history")

								/* APP.db.sequelize.query('CALL sitadev_iot_2.create_device_history (:device_id, :user_id, :pin, :device_name, :switch, :date)',
									{ 
										replacements: {
												device_id: datareq.device_id,
												user_id: datareq.user_id,
												pin: datareq.pin,
												device_name: pindevicename,
												switch: datareq.switch,
												date: datareq.date
											}, 
										type: APP.db.sequelize.QueryTypes.RAW 
									}
								) */

								APP.models.mysql.device_history.create({

									device_id: datareq.device_id,
									user_id: datareq.user_id,
									device_ip: result[0].device_ip,					
									switch: datareq.switch,
									device_name: pindevicename,
									device_type: device_type,
									pin: datareq.pin,
									date: datareq.date})
									
								.then((rows) => {

									console.log('checking all switch')
									APP.db.sequelize.query('CALL sitadev_iot_2.cek_saklar_pin (:user_id, :device_id)',
										{ 
											replacements: {
												device_id: datareq.device_id,
												user_id: datareq.user_id
											}, 
											type: APP.db.sequelize.QueryTypes.RAW 
										}
									)

									.then(device => {
										//console.log(device)

										response = {
											code : 'OK',
											error : 'false',
											message : 'Command success and saved'
										}
										return callback(null, response);

									}).catch((err) => {
										response = {
											code: 'ERR_DATABASE',
											data: JSON.stringify(err)
										}
										return callback(response);
									});

								}).catch((err) => {
									response = {
										code: 'ERR_DATABASE',
										data: JSON.stringify(err)
									}
									return callback(response);
								});
									
							}).catch((err) => {
								response = {
									code: 'ERR_DATABASE',
									data: JSON.stringify(err)
								}
								return callback(response);
							});
						} else {
							return callback(null, {
								code : 'NOT_FOUND',
								message : 'Device pin Not Found'
							});
						}
					}).catch((err) => {
						return callback({
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						});
					});
				}
				else if (datareq.mode == '1')
				{
					console.log('execute single device')
					APP.db.sequelize.query('CALL sitadev_iot_2.update_saklar (:user_id, :device_id, :switch)',
						{ 
							replacements: {
								device_id: datareq.device_id,
								user_id: datareq.user_id,
								switch: datareq.switch
							}, 
							type: APP.db.sequelize.QueryTypes.RAW 
						}
					)

					.then(device => {
			
						response = {
							code : 'OK',
							error : 'false',
							message : 'Command success and saved'
						}
						return callback(null, response);

					}).catch((err) => {
						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);
					});		
				}
				else
				{
					console.log('eror')
					response = {
						code: 'INVALID_REQUEST'
					}
					return callback(response);
				}
			}
			else
			{
				return callback(null, {
					code : 'DEVICE_DISSCONNECTED'
				});
			}
		}
		else
		{
			return callback(null, {
				code : 'NOT_FOUND',
				message : 'Device Not Found'
			});
		}
	}).catch((err) => {
		response = {
		code: 'ERR_DATABASE',
		data: JSON.stringify(err)
		}
		return callback(response);
	});
	
};

exports.sensordata = function (APP, req, callback) {

	var datareq = req.body
	var response = {}
	var pin
	var switch_status

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })
	if(!datareq.ampere) return callback({ code: 'MISSING_KEY' })
	if(!datareq.wattage) return callback({ code: 'MISSING_KEY' })
	if(!datareq.switch) return callback({ code: 'MISSING_KEY' })
	if(!datareq.sensor_status) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_type) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	if (datareq.device_type	 == '0')
		{
			pin = 'NULL'
		}
	else
		{
			pin = datareq.pin
		}

	APP.db.sequelize.query("update device set is_connected = 1 where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})

	.then(device => {		
		console.log('connection status updated')
		
		if (datareq.sensor_status == '0' && datareq.switch == '1')
			{
				switch_status = '0'
				console.log('update sensor_status')
	
				APP.db.sequelize.query("update device_pin set sensor_status = 1 where device_id = '" + datareq.device_id + "' and pin = '" + datareq.pin + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
			
				.then(device => {		
					console.log('sensor_status updated')
	
					console.log('sp_datasensor')
					APP.db.sequelize.query('CALL sitadev_iot_2.datasensor (:device_id, :user_id, :pin, :switch, :current_sensor, :watt, :date_device)',
						{ 
							replacements: {
								device_id: datareq.device_id,
								user_id: datareq.user_id,
								pin : pin,
								switch: switch_status,
								current_sensor: datareq.ampere,
								watt: datareq.wattage,
								date_device: datareq.date
							}, 
							type: APP.db.sequelize.QueryTypes.RAW 
						}
					)
	
					.then((rows) => {
	
						console.log(rows[0].message)
						var spreturn = rows[0].message
							
						if (rows[0].message == '0')
							{
								response = {
									code : 'OK',
									error : 'true',
									message : 'Device not activated yet'
								}
							}
						else
							{
								response = {
									code : 'OK',
									error : 'false',
									message : 'Data saved'
								}
							}
						return callback(null, response);
	
					}).catch((err) => {
						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);
					});
	
				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
				});
			}
		else
			{
				switch_status = datareq.switch
				console.log('update sensor_status')
	
				APP.db.sequelize.query("update device_pin set sensor_status = 0 where device_id = '" + datareq.device_id + "' and pin = '" + datareq.pin + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
			
				.then(device => {		
					console.log('sensor_status updated')
	
					console.log('sp_datasensor')
					APP.db.sequelize.query('CALL sitadev_iot_2.datasensor (:device_id, :user_id, :pin, :status_device, :current_sensor, :watt, :date_device)',
						{ 
							replacements: {
								device_id: datareq.device_id,
								user_id: datareq.user_id,
								pin : pin,
								status_device: switch_status,
								current_sensor: datareq.ampere,
								watt: datareq.wattage,
								date_device: datareq.date
							}, 
							type: APP.db.sequelize.QueryTypes.RAW 
						}
					)
	
					.then((rows) => {
	
						console.log(rows[0].message)
						var spreturn = rows[0].message
							
						if (rows[0].message == '0')
							{
								response = {
									code : 'OK',
									error : 'true',
									message : 'Device not activated yet'
								}
							}
						else
							{
								response = {
									code : 'OK',
									error : 'false',
									message : 'Data saved'
								}
							}
						return callback(null, response);
	
					}).catch((err) => {
						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);
					});
	
				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
				});
			}
			
	}).catch((err) => {
		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
	});
	
};

exports.sensordata_v2 = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device
	const DevicePIN = APP.models.mysql.device_pin

	let arrData = params.data	
	
	var response = {}

	query.options = {
		where : {
			user_id : params.user_id,
			device_id : params.device_id
		}
	}

	console.log(`===== FN SENSORDATA =====`);
	console.log(params)
	console.log(`===== == ========== =====`);

	async.waterfall([
		function (callback) {
			if(!params.user_id) callback({ code: 'MISSING_KEY', data: 'user_id' })
			if(!params.device_id) callback({ code: 'MISSING_KEY', data: 'device_id' })
			if(!params.device_type) callback({ code: 'MISSING_KEY', data: 'device_type' })
			if(!params.date) callback({ code: 'MISSING_KEY', data: 'date' })
			if(!params.data) callback({ code: 'MISSING_KEY', data: 'data' })

			callback(null, true)
		},
		function (data, callback) {
			Device.update({ is_connected: "1" }, query.options).then((resUpdated) => {
				console.log(`..... CONNECTION STATUS UPDATED .....`)

				callback(null, resUpdated)
			}).catch((err) => {
				callback(err)
			});
		},
		function (data, callback) {
			let dataArray = [];
			let counter = arrData.length;

			arrData.forEach(val => {
				if(!val.pin) callback({ code: 'MISSING_KEY', data: 'pin' })
				if(!val.ampere) callback({ code: 'MISSING_KEY', data: 'ampere' })
				if(!val.wattage) callback({ code: 'MISSING_KEY', data: 'wattage' })
				if(!val.switch) callback({ code: 'MISSING_KEY', data: 'switch' })
				if(!val.sensor_status) callback({ code: 'MISSING_KEY', data: 'sensor_status' })

				let pin = val.pin
				let switch_status = val.switch
				let sensor_status = "0"
				query.options.where.pin = val.pin
				
				if (params.device_type == '0') pin = null

				if (val.sensor_status == '0' && val.switch == '1') {
					sensor_status = "1"
					switch_status = "0"
				}

				DevicePIN.update({ sensor_status: sensor_status }, query.options).then((resUpdated) => {
					console.log(`..... SENSOR STATUS UPDATED .....`)

					APP.db.sequelize.query('CALL sitadev_iot_2.datasensor (:device_id, :user_id, :pin, :switch, :current_sensor, :watt, :date_device)', { 
						replacements: {
							device_id: params.device_id,
							user_id: params.user_id,
							pin : pin,
							switch: switch_status,
							current_sensor: val.ampere,
							watt: val.wattage,
							date_device: params.date
						}, type: APP.db.sequelize.QueryTypes.RAW 
					}).then((rows) => {
						if (rows[0].message == '0') {
							response = {
								pin : val.pin,
								message : 'Device not activated yet'
							}
						} else {
							response = {
								pin : val.pin,
								message : 'Data saved'
							}
						}
						
						dataArray.push(response)
						counter--

						if (counter == 0) {
							callback(null, { code: 'OK', data: dataArray })
						}
					}).catch((err) => {
						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}

						dataArray.push(response)
						counter--

						if (counter == 0) {
							callback({ code: 'GENERAL_ERR', data: dataArray })
						}
					});
				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					
					dataArray.push(response)
					counter--

					if (counter == 0) {
						callback({ code: 'GENERAL_ERR', data: dataArray })
					}
				});
			});
		}
	], function (err, res) {
		if (err) return callback(err)

		return callback(null, res)
	})
};

exports.runtimereport = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' }) 

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log('runtimereport')
	APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport (:user_id, :date_from, :date_to)',
		{ 
			replacements: {
				user_id: datareq.user_id,
				date_from: datareq.date_from,		
				date_to: datareq.date_to
			}, 
			type: APP.db.sequelize.QueryTypes.RAW 
		}
	)

	.then(device => {
		console.log(device)

		return callback(null, {
			code : (device && (device.length > 0)) ? 'FOUND' : 'NOT_FOUND',
			data : device
		});

	}).catch((err) => {
		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
	});
	
};

exports.runtimereportperday = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}
	
	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log('runtimereport_perday')
	APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport_perday (:user_id, :device_id, :date_from, :date_to)',
		{ 
			replacements: {
				user_id: datareq.user_id,
				device_id: datareq.device_id,
				date_from: datareq.date_from,		
				date_to: datareq.date_to
			}, 
			type: APP.db.sequelize.QueryTypes.RAW 
		}
	)

	.then(device => {
		console.log(device)

		return callback(null, {
			code : (device && (device.length > 0)) ? 'FOUND' : 'NOT_FOUND',
			data : device
		});

	}).catch((err) => {
		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
	});

};

exports.runtimereportperdev = function (APP, req, callback) {
  
	var datareq = req.body
	console.log(datareq);
	var response = {}
	
	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log('runtimereport_perdevice')
	APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport_perdevice (:user_id, :device_id, :date_from, :date_to)',
		{ 
			replacements: {
				user_id: datareq.user_id,
				device_id: datareq.device_id,
				date_from: datareq.date_from,		
				date_to: datareq.date_to
			}, 
			type: APP.db.sequelize.QueryTypes.RAW 
		}
	)

	.then(device => {

		return callback(null, {
			code : (device && (device.length > 0)) ? 'FOUND' : 'NOT_FOUND',
			data : device
		});

	}).catch((err) => {

		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
		
	});
	
};

exports.runtimereportdaily = function (APP, req, callback) {
  
	var datareq = req.body
	console.log(datareq);
	var response = {}
	
	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })
	if(!datareq.type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	if (datareq.type == '0')
	{
		console.log('runtimereport_perdevice')
		APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport_device_perday (:user_id, :device_id, :date_from, :date_to)',
			{ 
				replacements: {
					user_id: datareq.user_id,
					device_id: datareq.device_id,
					date_from: datareq.date_from,		
					date_to: datareq.date_to
				}, 
				type: APP.db.sequelize.QueryTypes.RAW 
			}
		)

		.then(device => {

			return callback(null, {
				code : (device && (device.length > 0)) ? 'FOUND' : 'NOT_FOUND',
				data : device
			});

		}).catch((err) => {

			response = {
				code: 'ERR_DATABASE',
				data: JSON.stringify(err)
			}
			return callback(response);
			
		});
	}
	else
	{
		console.log('runtimereport_perdevice')
		APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport_pin_perday (:user_id, :device_id, :pin, :date_from, :date_to)',
			{ 
				replacements: {
					user_id: datareq.user_id,
					device_id: datareq.device_id,
					pin : datareq.pin,
					date_from: datareq.date_from,		
					date_to: datareq.date_to
				}, 
				type: APP.db.sequelize.QueryTypes.RAW 
			}
		)

		.then(device => {

			return callback(null, {
				code : (device && (device.length > 0)) ? 'FOUND' : 'NOT_FOUND',
				data : device
			});

		}).catch((err) => {

			response = {
				code: 'ERR_DATABASE',
				data: JSON.stringify(err)
			}
			return callback(response);
			
		});
	}
	
};

exports.totalruntime = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })

	console.log('runtimereport_total')

	APP.db.sequelize.query("SELECT count(device_status) as active_device FROM sitadev_iot_2.device where device_status = '1' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})

	.then(active_device => {
		console.log(active_device)

		APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport_total (:user_id, :date_from, :date_to)',
			{ 
				replacements: {
					user_id: datareq.user_id,
					date_from: datareq.date_from,		
					date_to: datareq.date_to
				}, 
				type: APP.db.sequelize.QueryTypes.RAW 
			}
		)

		.then(total_runtime => {
			
			return callback(null, {
				code : (total_runtime && (total_runtime.length > 0)) ? 'FOUND' : 'NOT_FOUND',
				data : {
					runtime : total_runtime,
					device : active_device[0]
				}
			});
		
		}).catch((err) => {

			response = {
				code: 'ERR_DATABASE',
				data: JSON.stringify(err)
			}
			return callback(response);
			
		});
	
	}).catch((err) => {

		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
		
	});

};

exports.settimer = function (APP, req, callback) {
	const params = req.body
	const DevicePIN = APP.models.mysql.device_pin

	console.log(`========== PARAMS ==========`)
	console.log(params)

	if(!params.user_id) return callback({ code: 'MISSING_KEY' })
	if(!params.device_id) return callback({ code: 'MISSING_KEY' })
	if(!params.pin) return callback({ code: 'MISSING_KEY' })
	if(!params.timer_on) return callback({ code: 'MISSING_KEY' })
	if(!params.timer_off) return callback({ code: 'MISSING_KEY' })
	
	if(typeof params.pin != "object") return callback({
		code: 'INVALID_REQUEST',
		message: 'Expected array of pin'
	})	
	
	query.value = {
		timer_on : params.timer_on,
		timer_off : params.timer_off
	}
	query.options = {
		where : {
			device_id : params.device_id,
			user_id : params.user_id,
			pin : {
				[sequelize.Op.or]: params.pin	
			}
		}
	}

	DevicePIN.findAll(query.options).then((result) => {
		if (result.length > 0) {
			DevicePIN.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== RESULT ==========`)
				console.log(resUpdate)
				
				return callback(null, {
					code : 'OK',
					message : 'Set Timer Success'
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

exports.switchtimer = function (APP, req, callback) {
	const params = req.body
	const DevicePIN = APP.models.mysql.device_pin

	console.log(`========== PARAMS ==========`)
	console.log(params)
	
	if(!params.user_id) return callback({ code: 'MISSING_KEY' })
	if(!params.device_id) return callback({ code: 'MISSING_KEY' })
	if(!params.timer_status) return callback({ code: 'MISSING_KEY' })
	if(!params.pin) return callback({ code: 'MISSING_KEY' })

	query.value = {
		timer_status : params.timer_status
	}
	query.options = {
		where : {
			device_id : params.device_id,
			user_id : params.user_id,
			pin : params.pin
		}
	}

	DevicePIN.findAll(query.options).then((result) => {
		if (result.length > 0) 
		{
			if (params.timer_status == '0')
			{
				DevicePIN.update(query.value, query.options).then((resUpdate) => {
					console.log(`========== RESULT ==========`)
					console.log(resUpdate)
					
					return callback(null, {
						code : 'OK',
						message : 'Switch Off the Timer Success'
					});
				});
			}
			else
			{
				console.log("check timer");
				APP.db.sequelize.query("select count(*) as device from device_pin where timer_on is not null and timer_off is not null and user_id = '" + params.user_id + "' and device_id = '" + params.device_id + "'", { type: APP.db.sequelize.QueryTypes.SELECT})

				.then(device => {
					console.log(device)

					if (device[0].device > 0)
					{
						DevicePIN.update(query.value, query.options).then((resUpdate) => {
							console.log(`========== RESULT ==========`)
							console.log(resUpdate)
							
							return callback(null, {
								code : 'OK',
								message : 'Switch On the Timer Success'
							});
						});
					}
					else
					{
						return callback(null, {
							code : 'GENERAL_ERR',
							message : 'You have to set the timer first before switch the timer on'
						});
					}

				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
				});
			}
		} 
		else 
		{
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
}

exports.removetimer = function (APP, req, callback) {
	const params = req.body
	const DevicePIN = APP.models.mysql.device_pin

	console.log(`========== PARAMS ==========`)
	console.log(params)
	
	if(!params.user_id) return callback({ code: 'MISSING_KEY' })
	if(!params.device_id) return callback({ code: 'MISSING_KEY' })
	if(!params.pin) return callback({ code: 'MISSING_KEY' })

	query.value = {
		timer_on : null,
		timer_off : null,
		timer_status : 0
	}
	query.options = {
		where : {
			device_id : params.device_id,
			user_id : params.user_id,
			pin : params.pin
		}
	}

	DevicePIN.findAll(query.options).then((result) => {
		if (result.length > 0) {
			DevicePIN.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== RESULT ==========`)
				console.log(resUpdate)
				
				return callback(null, {
					code : 'OK',
					message : 'Remove Timer Success'
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
}

exports.testing = function (APP, req, callback) {
	
	var unirest = require('unirest');
	var response = {}
	var datareq = req.body
	console.log(datareq);
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	APP.db.sequelize.query("select device_key from users where user_id = '" + datareq.user_id + "' and username = '" + datareq.username + "'", { type: APP.db.sequelize.QueryTypes.SELECT})

	.then((device) => {
		console.log(device[0].device_key)

		var unirest = require('unirest');
				var connectdev = "Device ID " + datareq.device_id + " : " + datareq.nama_device + " sudah terkoneksi dengan sistem"
				console.log(connectdev)

				var notif = {
					"to": "cXYpF6N7WWo:APA91bFPL1LEJ2qpleti38VVEs-YCWdJAbtgts-0Qd2CpiV6KsLdk9TbNGVF1AXB3hM60AQTAfySONsfITUJUSMdQ-_BiaG32a734hKtotBZJ3NdjCPvYKgEWDpnumXPxF_w6uori1fG",
					"notification": 
						{
							"title": "Sitamoto",
							"body": connectdev
						},
					"data": 
						{
							"id": "1",
							"command": "1"
						}
				}
				
				console.log("sendnotif")
				unirest.post('https://fcm.googleapis.com/fcm/send')
					.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'key=AAAApNlKMJk:APA91bH2y94mcN6soiTrMJzZf7t52eiR4cRfUdoNA7lIeCWU_BkzGHApidOHIK5IHfIH_80v_BJ8JfJXPvi1xIUJZjptYKQ56Qu8wxojxDlNxeMbj9SVRm6jwBUjGhQRcskAbLqfcqPZ'})
					.send(notif)
					.end(function (response) {
						console.log(response.body);
						
					});
			
				response = {
					code : 'OK',
					error : 'false',
					message : 'Data saved'
				}
				return callback(null, response);

	}).catch((err) => {

	});
	
};

exports.command = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}
	const Device = APP.models.mysql.device
	const Device_pin = APP.models.mysql.device_pin

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.switch) return callback({ code: 'MISSING_KEY' })
	if(!datareq.mode) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	query.where = {
			device_id : datareq.device_id,
			user_id : datareq.user_id
	}
	query.attributes = { exclude: ['created_at', 'updated_at'] }

	Device.findAll(query).then(device => {
		if (device.length > 0) 
		{
			console.log(device[0].device_ip)
			console.log(device[0].device_name)
			console.log(device[0].device_type)
			console.log(device[0].is_connected)

			var device_ip = device[0].device_ip
			var device_type = device[0].device_type
			var device_name = device[0].device_name

			if (device[0].is_connected == '1')
			{
				var url = 'http://' + device[0].device_ip + ':9999/command'
				console.log(url);
				var params = {
					"device_id": datareq.device_id,
					"status": datareq.switch,
					"type": datareq.mode,
					"pin": datareq.pin
				}
				console.log(params);

				if (datareq.mode == '0' && device[0].device_type == '0')
				{
					console.log("hit mini CCU device");

					request.post(url, params, (err, result) => {
						if (err) 
						{
							APP.db.sequelize.query("update device set is_connected = 0 where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
					
							.then(device => {		
								console.log('connection status updated')

							}).catch((err) => {
								response = {
									code: 'ERR_DATABASE',
									data: JSON.stringify(err)
								}
								return callback(response);
							});
			
							response = {
								code : 'DEVICE_DISSCONNECTED'
							}
							console.log('response')
							return callback(null, response);
						} 
						else 
						{
							APP.db.sequelize.query("update device set is_connected = 1 where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
					
							.then(device => {		
								console.log('connection status updated')

							}).catch((err) => {
								response = {
									code: 'ERR_DATABASE',
									data: JSON.stringify(err)
								}
								return callback(response);
							});
			
							APP.db.sequelize.query("update device set switch = '" + datareq.switch + "' where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "' and device_ip = '" + device_ip + "'", { type: APP.db.sequelize.QueryTypes.RAW})
				
							.then(device => {
			
								console.log("add to history")
								APP.models.mysql.device_history.create({
									
									device_id: datareq.device_id,
									user_id: datareq.user_id,
									device_ip: device_ip,					
									switch: datareq.switch,
									device_name: device_name,
									device_type: device_type,
									date: date,
									created_at: date,
									updated_at: date
			
								}).then((rows) => {
			
									response = {
										code : 'OK',
										error : 'false',
										message : 'Command success and saved'
									}
									return callback(null, response);
			
								}).catch((err) => {
									response = {
										code: 'ERR_DATABASE',
										data: JSON.stringify(err)
									}
									return callback(response);
								});
				
							}).catch((err) => {
								response = {
									code: 'ERR_DATABASE',
									data: JSON.stringify(err)
								}
								return callback(response);
							});
						}
					})
				}
				else if (datareq.mode == '2' && device[0].device_type == '1')
				{
					console.log("hit single CCU device pin");

					query.options = {
						where : {
							device_id : datareq.device_id,
							user_id : datareq.user_id,
							pin : datareq.pin
						}
					}

					Device_pin.findAll(query.options).then((result) => {
						if (result.length > 0) 
						{
							console.log(result[0].device_ip)
							console.log(result[0].device_name)

							if (result[0].device_name == null)
							{
								var pindevicename = '-'
							}
							else
							{
								var pindevicename = result[0].device_name
							}

							request.post(url, params, (err, result) => {
								if (err) 
								{
									APP.db.sequelize.query("update device set is_connected = 0 where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
							
									.then(device => {		
										console.log('connection status updated')
									}).catch((err) => {
										response = {
											code: 'ERR_DATABASE',
											data: JSON.stringify(err)
										}
										return callback(response);
									});
					
									response = {
										code : 'DEVICE_DISSCONNECTED'
									}
									console.log('response')
									return callback(null, response);
					
								}
								else
								{
									APP.db.sequelize.query("update device set is_connected = 1 where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
							
									.then(device => {		
										console.log('connection status updated')
									}).catch((err) => {
										response = {
											code: 'ERR_DATABASE',
											data: JSON.stringify(err)
										}
										return callback(response);
									});
					
									APP.db.sequelize.query("update device_pin set switch = '" + datareq.switch + "' where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "' and device_ip = '" + result[0].device_ip + "' and pin = '" + datareq.pin + "'", { type: APP.db.sequelize.QueryTypes.RAW})
						
									.then(device => {
					
										console.log("add to history")
										APP.models.mysql.device_history.create({
					
											device_id: datareq.device_id,
											user_id: datareq.user_id,
											device_ip: result[0].device_ip,					
											switch: datareq.switch,
											device_name: pindevicename,
											device_type: device_type,
											pin: datareq.pin,
											date: date,
											created_at: date,
											updated_at: date
					
										}).then((rows) => {
					
											console.log('execute singel ccu device')
											APP.db.sequelize.query('CALL sitadev_iot_2.cek_saklar_pin (:user_id, :device_id)',
												{ 
													replacements: {
														device_id: datareq.device_id,
														user_id: datareq.user_id
													}, 
													type: APP.db.sequelize.QueryTypes.RAW 
												}
											)
					
											.then(device => {
												console.log(device)
					
												response = {
													code : 'OK',
													error : 'false',
													message : 'Command success and saved'
												}
												return callback(null, response);
					
											}).catch((err) => {
												response = {
													code: 'ERR_DATABASE',
													data: JSON.stringify(err)
												}
												return callback(response);
											});
					
										}).catch((err) => {
											response = {
												code: 'ERR_DATABASE',
												data: JSON.stringify(err)
											}
											return callback(response);
										});
						
									}).catch((err) => {
										response = {
											code: 'ERR_DATABASE',
											data: JSON.stringify(err)
										}
										return callback(response);
									});
								}
							});
						} 
						else 
						{
							return callback(null, {
								code : 'NOT_FOUND',
								message : 'Device Pin Not Found'
							});
						}
					}).catch((err) => {
						return callback({
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						});
					});	
				}
				else if (datareq.mode == '1' && device[0].device_type == '1')
				{
					console.log("hit single CCU device");

					request.post(url, params, (err, result) => {
						if (err) {
							APP.db.sequelize.query("update device set is_connected = 0 where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
					
							.then(device => {		
								console.log('connection status updated')
							}).catch((err) => {
								response = {
									code: 'ERR_DATABASE',
									data: JSON.stringify(err)
								}
								return callback(response);
							});
			
							response = {
								code : 'DEVICE_DISSCONNECTED'
							}
							console.log('response')
							return callback(null, response);
			
						}
						else
						{
							APP.db.sequelize.query("update device set is_connected = 1 where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
					
							.then(device => {		
								console.log('connection status updated')
							}).catch((err) => {
								response = {
									code: 'ERR_DATABASE',
									data: JSON.stringify(err)
								}
								return callback(response);
							});
			
							console.log('execute all pin')
							APP.db.sequelize.query('CALL sitadev_iot_2.update_saklar (:user_id, :device_id, :switch_status)',
								{ 
									replacements: {
										device_id: datareq.device_id,
										user_id: datareq.user_id,
										switch_status: datareq.switch
									}, 
									type: APP.db.sequelize.QueryTypes.RAW 
								}
							)
			
							.then(device => {
								console.log(device)
			
								response = {
									code : 'OK',
									error : 'false',
									message : 'Command success and saved'
								}
								return callback(null, response);
			
							}).catch((err) => {
								response = {
									code: 'ERR_DATABASE',
									data: JSON.stringify(err)
								}
								return callback(response);
							});
						}
					});
				}
				else
				{
					console.log('eror')
					response = {
						code: 'INVALID_REQUEST',
						message: 'Wrong mode or device type'
					}
					return callback(response);
				}
			}
			else
			{
				return callback(null, {
					code : 'DEVICE_DISSCONNECTED'
				});
			}
		}
		else
		{
			return callback(null, {
				code : 'NOT_FOUND',
				message : 'Device Not Found'
			});
		}
	}).catch((err) => {
		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
	});

};

exports.commandtest = function (APP, req, callback) {
	var datareq = req.body
	console.log(datareq);
	var response = {}
	const Device = APP.models.mysql.device

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_ip) return callback({ code: 'MISSING_KEY' })
	if(!datareq.status) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_name) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.mode) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	query.options = {
		where : {
			device_id : datareq.device_id,
			user_id : datareq.user_id,
			device_ip : datareq.device_ip
		}
	}

	if (datareq.mode == '0' && datareq.device_type == '0')
	{
		Device.findAll(query.options).then((result) => {
			if (result.length > 0) {
				APP.db.sequelize.query("update device set switch = '" + datareq.status + "' where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "' and device_ip = '" + datareq.device_ip + "'", { type: APP.db.sequelize.QueryTypes.RAW})
				.then(device => {

					console.log("add to history")
					APP.models.mysql.device_history.create({

						device_id: datareq.device_id,
						user_id: datareq.user_id,
						device_ip: datareq.device_ip,
						switch: datareq.status,
						device_name: datareq.device_name,
						device_type: datareq.device_type,
						date: date,
						created_at: date,
						updated_at: date

					}).then((rows) => {

						response = {
							code : 'OK',
							error : 'false',
							message : 'Command success and saved'
						}
						return callback(null, response);

					}).catch((err) => {
						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);
					});

				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
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
	}
	else if (datareq.mode == '2' && datareq.device_type == '1')
	{
		Device.findAll(query.options).then((result) => {
			if (result.length > 0) {

				APP.db.sequelize.query("update device_pin set switch = '" + datareq.status + "' where device_id = '" + datareq.device_id + "' and user_id = '" + datareq.user_id + "' and device_ip = '" + datareq.device_ip + "' and pin = '" + datareq.pin + "'", { type: APP.db.sequelize.QueryTypes.RAW})

				.then(device => {

					console.log("add to history")
					APP.models.mysql.device_history.create({

						device_id: datareq.device_id,
						user_id: datareq.user_id,
						device_ip: datareq.device_ip,
						switch: datareq.status,
						device_name: datareq.device_name,
						device_type: datareq.device_type,
						pin: datareq.pin,
						date: date,
						created_at: date,
						updated_at: date

					}).then((rows) => {

						console.log('execute singel ccu device')
						APP.db.sequelize.query('CALL sitadev_iot_2.cek_saklar_pin (:id_akun, :id_device, :device_ip)',
							{
								replacements: {
									id_device: datareq.device_id,
									id_akun: datareq.user_id,
									device_ip: datareq.device_ip
								},
								type: APP.db.sequelize.QueryTypes.RAW
							}
						)

						.then(device => {
							console.log(device)

							response = {
								code : 'OK',
								error : 'false',
								message : 'Command success and saved'
							}
							return callback(null, response);

						}).catch((err) => {
							response = {
								code: 'ERR_DATABASE',
								data: JSON.stringify(err)
							}
							return callback(response);
						});

					}).catch((err) => {
						response = {
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
						}
						return callback(response);
					});

				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
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
	}
	else if (datareq.mode == '1' && datareq.device_type == '1')
	{
		Device.findAll(query.options).then((result) => {
			if (result.length > 0) {
				console.log('execute all pin')
				APP.db.sequelize.query('CALL sitadev_iot_2.update_saklar (:id_akun, :id_device, :status_saklar)',
					{
						replacements: {
							id_device: datareq.device_id,
							id_akun: datareq.user_id,
							status_saklar: datareq.status
						},
						type: APP.db.sequelize.QueryTypes.RAW
					}
				)

				.then(device => {
					console.log(device)

					response = {
						code : 'OK',
						error : 'false',
						message : 'Command success and saved'
					}
					return callback(null, response);

				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
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
	}
	else
	{
		console.log('eror')
		response = {
			code: 'INVALID_REQUEST'
		}
		return callback(response);
	}
};

exports.commandsocket = function (APP, req, callback) {
	const Device = APP.models.mysql.device,
		DevicePIN = APP.models.mysql.device_pin,
		DeviceHistory = APP.models.mysql.device_history,
		Sequelize = APP.db.sequelize;

	let params = req.body,
		output = {},
		date = new Date()
	date.setHours(date.getHours())

	if (!params.user_id) return callback({ code: 'MISSING_KEY' })
	if (!params.device_id) return callback({ code: 'MISSING_KEY' })
	if (!params.switch) return callback({ code: 'MISSING_KEY' })
	if (!params.mode) return callback({ code: 'MISSING_KEY' })
	if (!params.pin) return callback({ code: 'MISSING_KEY' })

	socket.emit('commandapi', params)

	query.options = {
		where: {
			device_id: params.device_id,
			user_id: params.user_id
		}
	}

	Device.findOne(query.options).then(resDevice => {
		if (!resDevice) return callback({ code: "NOT_FOUND" })
		if (resDevice.is_connected == 0) return callback({ code: "DEVICE_DISSCONNECTED" })

		query.insert = {
			user_id: params.user_id,
			device_id: params.device_id,
			switch: params.switch
		}

		switch (params.mode) {
			case "1":
				console.log(`/ COMMAND SINGLE CCU DEVICE /`)

				Sequelize.query('CALL sitadev_iot_2.update_saklar (:user_id, :device_id, :switch)', {
					replacements: query.insert,
					type: Sequelize.QueryTypes.RAW
				}).then(device => {
					callback(null, {
						code: 'OK',
						error: 'false',
						message: 'Command success and saved'
					})
					return
				}).catch(err => {
					callback({
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					});
					return
				});

				break;
			case "2":
				console.log(`/ COMMAND SINGLE CCU DEVICE PIN /`)

				async.waterfall([
					function generatingQuery(callback) {
						console.log(`/... GENERATE QUERY .../`)
						// where
						query.options.where.pin = params.pin
						// insert
						query.insert.device_ip = resDevice.device_ip
						query.insert.device_type = resDevice.device_type
						query.insert.pin = params.pin
						query.insert.date = date
						// update
						query.update = { switch: params.switch }

						callback(null, query)
						return
					},

					function gettingData(query, callback) {
						console.log(`/... GET DATA DEVICE PIN .../`)

						DevicePIN.findOne(query.options)
							.then(resDevicePIN => {
								if (!resDevicePIN) return callback({
									code: "NOT_FOUND",
									message: "Device PIN not found!"
								})

								query.insert.device_name = (resDevicePIN.device_name) ? resDevicePIN.device_name : resDevice.device_name

								callback(null, query)
								return
							})
							.catch(err => {
								callback({
									code: 'ERR_DATABASE',
									data: JSON.stringify(err)
								})
								return
							})
					},

					function updatingData(query, callback) {
						console.log(`/... UPDATE DATA DEVICE PIN .../`)

						DevicePIN.update(query.update, query.options)
							.then(updatedDevicePIN => {
								callback(null, query)
								return
							})
							.catch(e => {
								callback({
									code: 'ERR_DATABASE',
									data: JSON.stringify(err)
								})
								return
							})
					},

					function creatingData(query, callback) {
						console.log(`/... CREATE DATA DEVICE HISTORY .../`)

						DeviceHistory.create(query.insert)
							.then(resultInsert => {
								callback(null, query)
								return
							})
							.catch((err) => {
								callback({
									code: 'ERR_DATABASE',
									data: JSON.stringify(err)
								})
								return
							})
					},

					function checkSwitchPIN(query, callback) {
						APP.db.sequelize.query('CALL sitadev_iot_2.cek_saklar_pin (:user_id, :device_id)', {
							replacements: {
								device_id: params.device_id,
								user_id: params.user_id
							},
							type: APP.db.sequelize.QueryTypes.RAW
						}).then(device => {
							callback(null, true)
							return
						}).catch((err) => {
							callback({
								code: 'ERR_DATABASE',
								data: JSON.stringify(err)
							});
							return
						})
					}
				], function (err, res) {
					if (err) {
						return callback(err)
					} else {
						return callback(null, {
							code: 'OK',
							error: 'false',
							message: 'Command success and saved'
						})
					}
				})

				break;
		}

	}).catch((err) => {
		return callback({
			"code": "GENERAL_ERR",
			"message": err
		})
	})
}

exports.ipupdate = function (APP, req, callback) {

	var datareq = req.body
	console.log(datareq);
	var response = {}
	const Device = APP.models.mysql.device
	const Device_pin = APP.models.mysql.device_pin

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_ip) return callback({ code: 'MISSING_KEY' })
	//if(!datareq.device_type) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	/* if (datareq.device_type == '0')
	{
		console.log("update ip device");

		query.value = {
			device_ip : datareq.device_ip
		}
		query.options = {
			where : {
				device_id : datareq.device_id,
				user_id : datareq.user_id
			}
		}

		Device.findAll(query.options).then((result) => {
			if (result.length > 0) {
				Device.update(query.value, query.options).then((resUpdate) => {
					console.log(`========== RESULT ==========`)
					console.log(resUpdate)
					
					return callback(null, {
						code : 'OK',
						message : 'Update ip success'
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
	}
	else
	{ */
		query.value = {
			device_ip : datareq.device_ip
		}
		query.options = {
			where : {
				device_id : datareq.device_id,
				user_id : datareq.user_id
			}
		}

		Device.findAll(query.options).then((result) => {
			if (result.length > 0) 
			{
				Device_pin.findAll(query.options).then((result) => {
					if (result.length > 0) 
					{
						Device.update(query.value, query.options).then((resUpdate) => {
					
							console.log(`========== Update Device IP ==========`)
							console.log(resUpdate)

							Device_pin.update(query.value, query.options).then((resUpdate) => {
								console.log(`========== Update Device Pin IP ==========`)
								console.log(resUpdate)
								
								return callback(null, {
									code : 'OK',
									message : 'Update ip success'
								});
							}).catch((err) => {
								return callback({
									code: 'ERR_DATABASE',
									data: JSON.stringify(err)
								});
							});
						}).catch((err) => {
							return callback({
								code: 'ERR_DATABASE',
								data: JSON.stringify(err)
							});
						});
					} 
					else 
					{
						return callback(null, {
							code : 'NOT_FOUND',
							message : 'Device Pin Not Found'
						});
					}
				}).catch((err) => {
					return callback({
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					});
				});
			} 
			else 
			{
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
	//}
};

exports.regischeck = function (APP, req, callback) {

	var datareq = req.body
	console.log(datareq);
	var response = {}
	const Device = APP.models.mysql.device

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_ip) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	query.options = {
		where : {
			device_id : datareq.device_id,
			user_id : datareq.user_id
		}
	}
	
	Device.findAll(query.options).then((result) => {
		if (result.length > 0) 
		{
			console.log("ipcheck");
			APP.db.sequelize.query("select count(*) as ip from device where user_id = '" + datareq.user_id + "' and device_id = '" + datareq.device_id + "' and device_ip = '"  + datareq.device_ip + "'", { type: APP.db.sequelize.QueryTypes.SELECT})
			
			.then(ip => {
				console.log(ip)

				if (ip[0].ip > 0)
				{
					response = {
						code : 'OK',
						message : '0'
					}
					return callback(null, response);
				}
				else	
				{
					response = {
						code : 'OK',
						message : '1'
					}
					return callback(null, response);
				}
			}).catch((err) => {
				response = {
					code: 'ERR_DATABASE',
					data: JSON.stringify(err)
				}
				return callback(response);
			});		
		}
		else 
		{
			response = {
				code : 'OK',
				message : '2'
			}
			return callback(null, response);
		}
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});

};

exports.activateallpin = function (APP, req, callback) {

	var datareq = req.body
	var response = {}
	console.log(datareq)
	const Device = APP.models.mysql.device_pin
	var message = ""
	var date = new Date();

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.active_status) return callback({ code: 'MISSING_KEY' })

	if (datareq.active_status == '0')
	{
		query.value = {
			device_status : datareq.active_status,
			active_date : null
		}
		message = "Deactivate all pin device success"
	}
	else
	{
		query.value = {
			device_status : datareq.active_status,
			active_date : date
		}
		message = "Activate all pin device success"
	}

	query.options = {
		where : {
			device_id : datareq.device_id,
			user_id : datareq.user_id
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) {
			Device.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== RESULT ==========`)
				console.log(resUpdate)
				
				return callback(null, {
					code : 'OK',
					message : message
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

exports.getpagingdevice = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.offset) return callback({ code: 'MISSING_KEY' })
	if(!datareq.limit) return callback({ code: 'MISSING_KEY' })
	if(!datareq.sort) return callback({ code: 'MISSING_KEY' })

	console.log('getpagingdevice')
	APP.db.sequelize.query('CALL sitadev_iot_2.get_device_count (:user_id, :device_id, :device_ip, :device_name, :device_status, :install_date, :active_date)',
		{ 
			replacements: {
				user_id: datareq.user_id,
				device_id: datareq.device_id,
				device_ip: datareq.device_ip,
				device_name: datareq.device_name,
				device_status: datareq.device_status,
				install_date: datareq.install_date,
				active_date: datareq.active_date
			}, 
			type: APP.db.sequelize.QueryTypes.RAW 
		}
	)

	.then(datacount => {

		APP.db.sequelize.query('CALL sitadev_iot_2.get_device (:user_id, :device_id, :device_ip, :device_name, :device_status, :install_date, :active_date, :offset, :limit, :sort)',
			{ 
				replacements: {
					user_id: datareq.user_id,
					device_id: datareq.device_id,
					device_ip: datareq.device_ip,
					device_name: datareq.device_name,
					device_status: datareq.device_status,
					install_date: datareq.install_date,
					active_date: datareq.active_date,
					offset: datareq.offset,
					limit: datareq.limit,
					sort: datareq.sort
				}, 
				type: APP.db.sequelize.QueryTypes.RAW 
			}
		)

		.then(device => {

			return callback(null, {
				code : (device && (device.length > 0)) ? 'FOUND' : 'NOT_FOUND',
				data : {datafound : device,
				datacount : datacount}
			});
		
		}).catch((err) => {

			response = {
				code: 'ERR_DATABASE',
				data: JSON.stringify(err)
			}
			return callback(response);
			
		});
		
	}).catch((err) => {

		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
		
	});		
	
};

exports.getpaginghistory = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.offset) return callback({ code: 'MISSING_KEY' })
	if(!datareq.limit) return callback({ code: 'MISSING_KEY' })
	if(!datareq.sort) return callback({ code: 'MISSING_KEY' })

	console.log('getpaginghistory')
	APP.db.sequelize.query('CALL sitadev_iot_2.get_device_history_count (:user_id, :device_id, :device_ip, :device_name, :date)',
		{ 
			replacements: {
				user_id: datareq.user_id,
				device_id: datareq.device_id,
				device_ip: datareq.device_ip,
				device_name: datareq.device_name,
				date: datareq.date
			}, 
			type: APP.db.sequelize.QueryTypes.RAW 
		}
	)

	.then(datacount => {

		APP.db.sequelize.query('CALL sitadev_iot_2.get_device_history (:user_id, :device_id, :device_ip, :device_name, :date, :offset, :limit, :sort)',
			{ 
				replacements: {
					user_id: datareq.user_id,
					device_id: datareq.device_id,
					device_ip: datareq.device_ip,
					device_name: datareq.device_name,
					date: datareq.date,
					offset: datareq.offset,
					limit: datareq.limit,
					sort: datareq.sort
				}, 
				type: APP.db.sequelize.QueryTypes.RAW 
			}
		)

		.then(device => {

			return callback(null, {
				code : (device && (device.length > 0)) ? 'FOUND' : 'NOT_FOUND',
				data : {datafound : device,
				datacount : datacount}
			});
		
		}).catch((err) => {

			response = {
				code: 'ERR_DATABASE',
				data: JSON.stringify(err)
			}
			return callback(response);
			
		});
		
	}).catch((err) => {

		response = {
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		}
		return callback(response);
		
	});
	
};

