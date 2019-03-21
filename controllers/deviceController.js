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

exports.registerdevice = function (APP, req, callback) {
	
	var datareq = req.body
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.ip_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.nama_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	if (datareq.type == '0')
		{
			console.log("insert device");
			APP.models.mysql.device.create({
				device_id: datareq.id_device,
				user_id: datareq.id_akun,
				ip_device: datareq.ip_device,		
				device_status: '0',
				device_name: datareq.nama_device,
				install_date: date,
				switch: '0',
				number_of_pin : datareq.pin,
				device_type: datareq.type
		
			}).then((rows) => {

				APP.db.sequelize.query("select device_key from users where user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.SELECT})

				.then((device) => {
					console.log(device[0].device_key)

					var unirest = require('unirest');
					var connectdev = "Device ID " + datareq.id_device + " : " + datareq.nama_device + " sudah terkoneksi dengan sistem"
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

				APP.db.sequelize.query("select device_key from users where user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.SELECT})

				.then((device) => {
					console.log(device[0].device_key)
				
					var unirest = require('unirest');
					var connectdev = "Device ID " + datareq.id_device + " : " + datareq.nama_device + " gagal terkoneksi dengan sistem, mohon coba lagi"
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
		{
			console.log("insert device");
			APP.db.sequelize.query('CALL sitadev_iot_2.create_devicepin (:id_device, :ip_device, :id_akun, :nama_device, :tanggal_install, :jumlah_pin, :group_id)',
				{ 
					replacements: {
						id_device: datareq.id_device,
						id_akun: datareq.id_akun,
						ip_device: datareq.ip_device,
						nama_device: datareq.nama_device,
						tanggal_install: date,
						jumlah_pin : datareq.pin,
						group_id : "null"
					}, 
					type: APP.db.sequelize.QueryTypes.RAW 
				}

			).then((rows) => {

				APP.db.sequelize.query("select device_key from users where user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.SELECT})

				.then((device) => {
					console.log(device[0].device_key)

					var unirest = require('unirest');
					var connectdev = "Device ID " + datareq.id_device + " : " + datareq.nama_device + " sudah terkoneksi dengan sistem"
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

				APP.db.sequelize.query("select device_key from users where user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.SELECT})

				.then((device) => {
					console.log(device[0].device_key)
					
					var unirest = require('unirest');
					var connectdev = "Device ID " + datareq.id_device + " : " + datareq.nama_device + " gagal terkoneksi dengan sistem, mohon coba lagi"
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
	
};

exports.getdevice = function (APP, req, callback) {
    const params = req.body
    const Device = APP.models.mysql.device
    
    if(!params.id_akun) return callback({ code: 'MISSING_KEY' })
    
    query.where = { user_id : params.id_akun }
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

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	APP.db.sequelize.query("select device_id, ip_device, pin, device_name, device_status, switch from device_pin where user_id = '" + datareq.id_akun + "' and device_id = '" + datareq.id_device + "'", { type: APP.db.sequelize.QueryTypes.SELECT})
	
	.then(device => {
		console.log(device)
		
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

exports.activatedevice = function (APP, req, callback) {

	var datareq = req.body
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	if (datareq.type == '0')
	{
		console.log("activate device");
		APP.db.sequelize.query("update device set device_status = 1, active_date = now() where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
		
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
		console.log("activate device");
		APP.db.sequelize.query("update device_pin set device_status = 1, active_date = now() where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "' and pin = '" + datareq.pin + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
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
	
};

exports.deactivatedevice = function (APP, req, callback) {

	var datareq = req.body
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	if (datareq.type == '0')
	{
		console.log("deactivate device");
		APP.db.sequelize.query("update device set device_status = 0, active_date = NULL where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
		
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
		console.log("deactivate device");
		APP.db.sequelize.query("update device_pin set device_status = 0, active_date = NULL where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "' and pin = '" + datareq.pin + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
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
	
};

exports.registerkeyword = function (APP, req, callback) {
	
	var params = APP.queries.select('device_detail_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq)
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	APP.models.mysql.device_detail_listrik.create({
        id_device: datareq.id_device,
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
	console.log(datareq.id_device)
	console.log(datareq.keyword)
	
	APP.db.sequelize.query("select id_pin from device_detail_listrik where id_device = '" + datareq.id_device + "' and keyword = '" + datareq.keyword + "'", { type: APP.db.sequelize.QueryTypes.SELECT})
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

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	query.where = { 
		user_id : datareq.id_akun,
		device_id : datareq.id_device,
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

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	query.where = { 
		user_id : datareq.id_akun,
		device_id : datareq.id_device,
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
	
	var datareq = req.body
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })
	if(!datareq.nama_device) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	if (datareq.type == '0')
	{
		APP.db.sequelize.query("update device set device_name = '" + datareq.nama_device + "' where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
		
		.then(device => {		

			response = {
				code : 'OK',
				error : 'false',
				message : 'Update success',
				data : {
						id_device: datareq.id_device,
						id_akun: datareq.id_akun,
						nama_device: datareq.nama_device
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
	}
	else
	{
		APP.db.sequelize.query("update device_pin set device_name = '" + datareq.nama_device + "' where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "' and pin = '" + datareq.pin + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
		.then(device => {		

			response = {
				code : 'OK',
				error : 'false',
				message : 'Update success',
				data : {
						id_device: datareq.id_device,
						id_akun: datareq.id_akun,
						nama_device: datareq.nama_device,
						pin: datareq.pin
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
	}
	
};

exports.deletedevice = function (APP, req, callback) {
	
	var datareq = req.body
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.type) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	if (datareq.type == '0')
	{
		APP.db.sequelize.query("delete from device where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
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
	{
		APP.db.sequelize.query("delete from device where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
		.then(device => {
			console.log("delete device")

			APP.db.sequelize.query("delete from device_pin where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
			.then(device => {
				console.log("delete pin")

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
			
		}).catch((err) => {
			response = {
				code: 'ERR_DATABASE',
				data: JSON.stringify(err)
			}
			return callback(response);
		});
	}
	
};

exports.devicehistory = function (APP, req, callback) {
	
	var datareq = req.body
	var response = {}
	console.log(datareq)
	const Device = APP.models.mysql.device_history

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	var query = "select device_id, ip_device, IFNULL(pin,'-') as pin, device_name, device_type, switch, date from device_history where user_id = '" + datareq.id_akun + "' and date > '" + datareq.date_from + "' and date < '" + datareq.date_to + "'"

	if (datareq.id_device != '')
	{
		query = query + " and device_id = '" + datareq.id_device + "'"
	}
	
	APP.db.sequelize.query(query, { type: APP.db.sequelize.QueryTypes.SELECT})
	
	.then(device => {
		console.log(device)
		
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

exports.commandtest = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.ip_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.status) return callback({ code: 'MISSING_KEY' })
	if(!datareq.nama_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.mode) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	if (datareq.mode == '0' && datareq.type == '0')
	{
		APP.db.sequelize.query("update device set switch = '" + datareq.status + "' where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "' and ip_device = '" + datareq.ip_device + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
		.then(device => {

			console.log("add to history")
			APP.models.mysql.device_history.create({

				device_id: datareq.id_device,
				user_id: datareq.id_akun,
				ip_device: datareq.ip_device,					
				switch: datareq.status,
				device_name: datareq.nama_device,
				device_type: datareq.type,
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
	else if (datareq.mode == '2' && datareq.type == '1')
	{
		APP.db.sequelize.query("update device_pin set switch = '" + datareq.status + "' where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "' and ip_device = '" + datareq.ip_device + "' and pin = '" + datareq.pin + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
		.then(device => {

			console.log("add to history")
			APP.models.mysql.device_history.create({

				device_id: datareq.id_device,
				user_id: datareq.id_akun,
				ip_device: datareq.ip_device,					
				switch: datareq.status,
				device_name: datareq.nama_device,
				device_type: datareq.type,
				pin: datareq.pin,
				date: date,
				created_at: date,
				updated_at: date

			}).then((rows) => {

				console.log('execute singel ccu device')
				APP.db.sequelize.query('CALL sitadev_iot_2.cek_saklar_pin (:id_akun, :id_device, :ip_device)',
					{ 
						replacements: {
							id_device: datareq.id_device,
							id_akun: datareq.id_akun,
							ip_device: datareq.ip_device
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
	else if (datareq.mode == '1' && datareq.type == '1')
	{
		console.log('execute all pin')
		APP.db.sequelize.query('CALL sitadev_iot_2.update_saklar (:id_akun, :id_device, :ip_device, :status_saklar)',
			{ 
				replacements: {
					id_device: datareq.id_device,
					id_akun: datareq.id_akun,
					ip_device: datareq.ip_device,					
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

exports.sensordata = function (APP, req, callback) {

	var datareq = req.body
	var response = {}
	var pin
	var status_saklar

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.ip_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.pin) return callback({ code: 'MISSING_KEY' })
	if(!datareq.ampere) return callback({ code: 'MISSING_KEY' })
	if(!datareq.wattage) return callback({ code: 'MISSING_KEY' })
	if(!datareq.status) return callback({ code: 'MISSING_KEY' })
	if(!datareq.sensor_status) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	if (datareq.tipe_device == '0')
		{
			pin = 'NULL'
		}
	else
		{
			pin = datareq.pin
		}

	APP.db.sequelize.query("update device set is_connected = 1 where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})

	.then(device => {		
		console.log('connection status updated')
		
		if (datareq.sensor_status == '0' && datareq.status == '1')
			{
				status_saklar = '0'
				console.log('update health status')
	
				APP.db.sequelize.query("update device set health_status = 1 where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
			
				.then(device => {		
					console.log('health status updated')
	
					console.log('sp_datasensor')
					APP.db.sequelize.query('CALL sitadev_iot_2.datasensor (:id_device, :id_akun, :ip_device, :pin, :status_device, :current_sensor, :watt, :date_device)',
						{ 
							replacements: {
								id_device: datareq.id_device,
								id_akun: datareq.id_akun,
								ip_device: datareq.ip_device,
								pin : pin,
								status_device: status_saklar,
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
				status_saklar = datareq.status
				console.log('update health status')
	
				APP.db.sequelize.query("update device set health_status = 0 where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
			
				.then(device => {		
					console.log('health status updated')
	
					console.log('sp_datasensor')
					APP.db.sequelize.query('CALL sitadev_iot_2.datasensor (:id_device, :id_akun, :ip_device, :pin, :status_device, :current_sensor, :watt, :date_device)',
						{ 
							replacements: {
								id_device: datareq.id_device,
								id_akun: datareq.id_akun,
								ip_device: datareq.ip_device,
								pin : pin,
								status_device: status_saklar,
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

exports.runtimereport = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' }) 

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log('runtimereport')
	APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport (:id_akun, :date_from, :date_to)',
		{ 
			replacements: {
				id_akun: datareq.id_akun,
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
	
	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.ip_device) return callback({ code: 'MISSING_KEY' })
	// if(!datareq.type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log('runtimereport_perday')
	APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport_perday (:id_akun, :id_device, :ip_device, :date_from, :date_to)',
		{ 
			replacements: {
				id_akun: datareq.id_akun,
				id_device: datareq.id_device,
				ip_device: datareq.ip_device,
				tipe_device: datareq.type,
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
    // CALL `sitadev_iot`.`sp_runtimereport_perdevice`(id_akun, id_device, ip_device, start_date, end_date );
	
	var datareq = req.body
	console.log(datareq);
	var response = {}
	
	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.ip_device) return callback({ code: 'MISSING_KEY' })
	// if(!datareq.type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log('runtimereport_perdevice')
	APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport_perdevice (:id_akun, :id_device, :ip_device, :date_from, :date_to)',
		{ 
			replacements: {
				id_akun: datareq.id_akun,
				id_device: datareq.id_device,
				ip_device: datareq.ip_device,
				tipe_device: datareq.type,
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

exports.totalruntime = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log('runtimereport_total')
	APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport_total (:id_akun, :date_from, :date_to)',
		{ 
			replacements: {
				id_akun: datareq.id_akun,
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

exports.settimer = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device

	console.log(`========== PARAMS ==========`)
	console.log(params)

	if(!params.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!params.id_device) return callback({ code: 'MISSING_KEY' })
	if(!params.ip_device) return callback({ code: 'MISSING_KEY' })
	if(!params.timer_on) return callback({ code: 'MISSING_KEY' })
	if(!params.timer_off) return callback({ code: 'MISSING_KEY' })
	
	query.value = {
		timer_on : params.timer_on,
		timer_off : params.timer_off
	}
	query.options = {
		where : {
			device_id : params.id_device,
			user_id : params.id_akun,
			ip_device : params.ip_device
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) {
			Device.update(query.value, query.options).then((resUpdate) => {
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
	const Device = APP.models.mysql.device

	console.log(`========== PARAMS ==========`)
	console.log(params)
	
	if(!params.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!params.id_device) return callback({ code: 'MISSING_KEY' })
	if(!params.ip_device) return callback({ code: 'MISSING_KEY' })
	if(!params.timer_status) return callback({ code: 'MISSING_KEY' })

	query.value = {
		timer_status : params.timer_status
	}
	query.options = {
		where : {
			device_id : params.id_device,
			user_id : params.id_akun,
			ip_device : params.ip_device
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) {
			Device.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== RESULT ==========`)
				console.log(resUpdate)
				
				return callback(null, {
					code : 'OK',
					message : 'Switch Timer Success'
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

exports.removetimer = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device

	console.log(`========== PARAMS ==========`)
	console.log(params)
	
	if(!params.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!params.id_device) return callback({ code: 'MISSING_KEY' })
	if(!params.ip_device) return callback({ code: 'MISSING_KEY' })

	query.value = {
		timer_on : null,
		timer_off : null,
		timer_status : 0
	}
	query.options = {
		where : {
			device_id : params.id_device,
			user_id : params.id_akun,
			ip_device : params.ip_device
		}
	}

	Device.findAll(query.options).then((result) => {
		if (result.length > 0) {
			Device.update(query.value, query.options).then((resUpdate) => {
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

	APP.db.sequelize.query("select device_key from users where id_akun = '" + datareq.id_akun + "' and username = '" + datareq.username + "'", { type: APP.db.sequelize.QueryTypes.SELECT})

	.then((device) => {
		console.log(device[0].device_key)

		var unirest = require('unirest');
				var connectdev = "Device ID " + datareq.id_device + " : " + datareq.nama_device + " sudah terkoneksi dengan sistem"
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

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.ip_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.status) return callback({ code: 'MISSING_KEY' })
	if(!datareq.nama_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.type) return callback({ code: 'MISSING_KEY' })
	if(!datareq.mode) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	var url = 'http://' + datareq.ip_device + ':9999/command'
	console.log(url);
	var params = {
		"id_device": datareq.id_device,
		"status": datareq.status,
		"type": datareq.mode,
		"pin": datareq.pin
	}
	console.log(params);
	
	if (datareq.mode == '0' && datareq.type == '0')
	{
		console.log("hit device");
		request.post(url, params, (err, result) => {
			if (err) 
			{
				APP.db.sequelize.query("update device set is_connected = 0 where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
		
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
				APP.db.sequelize.query("update device set is_connected = 1 where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
		
				.then(device => {		
					console.log('connection status updated')
				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
				});

				APP.db.sequelize.query("update device set switch = '" + datareq.status + "' where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "' and ip_device = '" + datareq.ip_device + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
				.then(device => {

					console.log("add to history")
					APP.models.mysql.device_history.create({
						
						device_id: datareq.id_device,
						user_id: datareq.id_akun,
						ip_device: datareq.ip_device,					
						switch: datareq.status,
						device_name: datareq.nama_device,
						device_type: datareq.type,
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
	else if (datareq.mode == '2' && datareq.type == '1')
	{
		console.log("hit device");
		request.post(url, params, (err, result) => {
			if (err) {
				APP.db.sequelize.query("update device set is_connected = 0 where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
		
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
				APP.db.sequelize.query("update device set is_connected = 1 where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
		
				.then(device => {		
					console.log('connection status updated')
				}).catch((err) => {
					response = {
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					}
					return callback(response);
				});

				APP.db.sequelize.query("update device_pin set switch = '" + datareq.status + "' where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "' and ip_device = '" + datareq.ip_device + "' and pin = '" + datareq.pin + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
				.then(device => {

					console.log("add to history")
					APP.models.mysql.device_history_listrik.create({

						device_id: datareq.id_device,
						user_id: datareq.id_akun,
						ip_device: datareq.ip_device,					
						switch: datareq.status,
						device_name: datareq.nama_device,
						device_type: datareq.type,
						pin: datareq.pin,
						date: date,
						created_at: date,
						updated_at: date

					}).then((rows) => {

						console.log('execute singel ccu device')
						APP.db.sequelize.query('CALL sitadev_iot_2.cek_saklar_pin (:id_akun, :id_device, :ip_device)',
							{ 
								replacements: {
									id_device: datareq.id_device,
									id_akun: datareq.id_akun,
									ip_device: datareq.ip_device
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
	else if (datareq.mode == '1' && datareq.type == '1')
	{
		console.log("hit device");
		request.post(url, params, (err, result) => {
			if (err) {
				APP.db.sequelize.query("update device set is_connected = 0 where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
		
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
				APP.db.sequelize.query("update device set is_connected = 1 where device_id = '" + datareq.id_device + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
		
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
				APP.db.sequelize.query('CALL sitadev_iot_2.update_saklar (:id_akun, :id_device, :ip_device, :status_saklar)',
					{ 
						replacements: {
							id_device: datareq.id_device,
							id_akun: datareq.id_akun,
							ip_device: datareq.ip_device,					
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
			}
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

exports.ipupdate = function (APP, req, callback) {

	var datareq = req.body
	console.log(datareq);
	var response = {}
	const Device = APP.models.mysql.device

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.ip_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.type) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	if (datareq.type == '0')
	{
		console.log("update ip device");

		query.value = {
			ip_device : datareq.ip_device
		}
		query.options = {
			where : {
				device_id : datareq.id_device,
				user_id : datareq.id_akun
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
	{
		query.value = {
			ip_device : datareq.ip_device
		}
		query.options = {
			where : {
				device_id : datareq.id_device,
				user_id : datareq.id_akun
			}
		}

		Device.findAll(query.options).then((result) => {
			if (result.length > 0) {
				Device.update(query.value, query.options).then((resUpdate) => {
					
					console.log(`========== RESULT ==========`)
					console.log(resUpdate)

					const Device_pin = APP.models.mysql.device_pin
					query.value = {
						ip_device : datareq.ip_device
					}
					query.options = {
						where : {
							device_id : datareq.id_device,
							user_id : datareq.id_akun
						}
					}

					Device_pin.findAll(query.options).then((result) => {
						if (result.length > 0) {
							Device_pin.update(query.value, query.options).then((resUpdate) => {
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
								message : 'Device Pin Not Found'
							});
						}
					}).catch((err) => {
						return callback({
							code: 'ERR_DATABASE',
							data: JSON.stringify(err)
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
	}
};

exports.regischeck = function (APP, req, callback) {

	var datareq = req.body
	console.log(datareq);
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
	if(!datareq.ip_device) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	console.log("regischeck");
	APP.db.sequelize.query("select count(*) as device from device where user_id = '" + datareq.id_akun + "' and device_id = '" + datareq.id_device + "'", { type: APP.db.sequelize.QueryTypes.SELECT})
	
	.then(device => {
		console.log(device)

		if (device[0].device > 0)
		{
			console.log("ipcheck");
			APP.db.sequelize.query("select count(*) as ip from device where user_id = '" + datareq.id_akun + "' and device_id = '" + datareq.id_device + "' and ip_device = '"  + datareq.ip_device + "'", { type: APP.db.sequelize.QueryTypes.SELECT})
			
			.then(ip => {
				console.log(ip)

				if (ip[0].ip > 0)
				{
					response = {
						code : 'OK',
						message : '2'
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
					message : '0'
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
	
};

exports.updateusertdl = function (APP, req, callback) {

	var datareq = req.body
	console.log(datareq);
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.username) return callback({ code: 'MISSING_KEY' })
	if(!datareq.tdl) return callback({ code: 'MISSING_KEY' })
	if(!datareq.daya) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	console.log("updatetdl");
	APP.db.sequelize.query("update users set tdl = '" + datareq.tdl + "', power = '" + datareq.daya + "' where user_id = '" + datareq.id_akun + "' and username = '" + datareq.username + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
	.then(device => {

		response = {
			code : 'OK',	
			message : 'Update success'
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

exports.activateallpin = function (APP, req, callback) {

	var datareq = req.body
	var response = {}
	console.log(datareq)
	const Device = APP.models.mysql.device_pin
	var message = ""
	var date = new Date();

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })
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
			device_id : datareq.id_device,
			user_id : datareq.id_akun
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