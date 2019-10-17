/**
 * SETUP DEPENDENCIES
 */

 /* PACKAGE */
const environment = require('./app.json').env;
require('env2')('.env.' + environment);
const app = require('express')(),
	  http = require('http').createServer(app),
	  io = require('socket.io')(http),
	  async = require('async'),
	  chalk = require('chalk'),
	  vascommkit = require('vascommkit');
/* CONFIG & FUNCTIONS */
const db = require('./config/db.js'),
	  model = require('./config/model.js'),
	  fnOutput = require('./functions/output.js');
	  fnRequest = require('./functions/request.js');
/* MODEL & CONTROLLER */
const Device = require('./models/device.js')(db.sequelize, db.Sequelize),
	  DevicePIN = require('./models/device_pin.js')(db.sequelize, db.Sequelize),
	  User = require('./models/user.js')(db.sequelize, db.Sequelize),
	  DeviceSession = require('./models/mongo/device_session.js')(db.mongo),
	  deviceController = require('./controllers/deviceController.js');
/* DECLARATION */
var output = {},
	payloadLog = {},
	query = {},
	req = {};
req.APP = {};

/**
 * SOCKET ON
 */
async function updateSession(query, callback) {
	DeviceSession.updateOne(
		query.mongo.find,
		{ $set : query.mongo.update },
		{ upsert : true },
	    function(err, result){
	        if (err){
				callback(err);
	        } else {
	            callback(null, result);
	        }
	    }
	);
}

io.on('connection', (socket) => {
	payloadLog = {}
	payloadLog.info = `CONNECTION ESTABILISHED`
	payloadLog.level = { error : false }
	payloadLog.message = `SOCKET ID : ${socket.id}`
	
	req.APP.db = db;
	
	model(db, (err, result) => {
		if (err) {
			payloadLog.info = `${payloadLog.info} : ERROR`;
			payloadLog.level = { error : true }
			payloadLog.message = payloadLog.message +
									`\n${JSON.stringify(err)}`;
		} else {
			req.APP.models = result;
			payloadLog.message = payloadLog.message +
									`\n> INIT CONNECTION SUCCESS`;
		}

		fnOutput.log(payloadLog)
	});


	// Handshake Device
	socket.on('handshake', (device, callback) => {
		let log = {}
		req.event = `handshake`
		log.info = `DEVICE HANDSHAKE`
		log.body = req.body = device
		log.level = { error : false }
		log.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${device.device_id}`

		query.sql = {
			where : { device_id : device.device_id },
			attributes : [ 'device_id' ]
		};
		query.mongo = {
			find : { device_id : device.device_id },
			update : { session_id : socket.id },
			create : {
				device_id : device.device_id,
				session_id : socket.id,
			}
		};

		async.waterfall([
			function checkDevice(callback) {
				log.message = log.message +
									 `\n> CHECK DEVICE`
									 
				deviceController.regischeck(req.APP, req, (err, result) => {
					if (err) { 
						callback(err); 
					} else {
						switch (result.message) {
							case '1':
								log.message = log.message + ' : DEVICE_IP NOT MATCH'
								
								deviceController.ipupdate(req.APP, req, (err, result) => {
									if (err) {
										callback(err, result);
									} else {
										callback(null, result);
									}
								});
								break;
							
							case '2':
								log.message = log.message + ' : DEVICE_ID NOT REGISTERED'

								deviceController.registerdevice(req.APP, req, (err, result) => {
									if (err) {
										callback(err, result);
									} else {
										callback(null, result);
									}
								});
			
								break;
			
							default:
								callback(null, { code: 'OK' });
						}						
					}
				});
			},

			function updateDeviceStatus(data, callback) {
				log.message = log.message +
									 `\n> UPDATE DEVICE STATUS`

				Device.update({ is_connected : 1 }, query.sql).then((result) => {
					callback(null, data);
				}).catch((err) => {
					callback(err);
				});
			},

			function updateDeviceSession(data, callback) {
				log.message = log.message +
									 `\n> UPDATE DEVICE SESSION`

				updateSession(query, (err, res) => {
					if (err) {
						callback(err)
					} else {
						callback(null, data)
					}
				})
			},

			function getPinName(data, callback) {
				log.message = log.message +
									 `\n> GET PIN NAME`

				query.sql.attributes = [ 'pin', 'device_name' ]

				DevicePIN.findAll(query.sql).then( (result) => {
					if (!result) return callback({
						code : 'NOT_FOUND',
						message : 'Device Pin Not Found'
					})
					
					callback(null, result)
				}).catch((err) => {
					callback(err);
				});
			}

		], function (err, res) {
			if (err) {
				log.info = `${log.info} : ERROR`;
				log.level = { error : true }
				log.message = log.message +
									 `\n${JSON.stringify(err)}`;

				fnOutput.insert(req, err, log)

				if (device.device_type == '1') {
					return callback(err, res);
				}
			}
			fnOutput.insert(req, res, log)

			if (device.device_type == '1') {
				return callback(null, res);
			}
		});
	});
	// Handshake Hub
	socket.on('handshake-hub', (hub, callback) => {
		payloadLog = {}
		req.event = `handshake-hub`
		payloadLog.info = `HANDSHAKE HUB`
		payloadLog.body = req.body = device
		payloadLog.level = { error : false }
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${device.device_id}`

		query.sql = {
			where : { device_id : hub.device_id },
			attributes : [ 'device_id' ]
		};
		query.mongo = {
			find : { device_id : hub.device_id },
			update : { session_id : socket.id },
			create : {
				device_id : hub.device_id,
				session_id : socket.id,
			}
		};

		async.waterfall([
			function handshake(callback) {				
				query.sql = { 
					where : { user_id : hub.user_id },
					attributes : [
						'user_id',
						'device_id',
						'device_name',
						'pin'
					]
				}
				DevicePIN.findAll(query.sql).then( (result) => {
					callback(null, result)
				})
			},
			function session(data, callback) {
				payloadLog.message = payloadLog.message +
									 `\n> UPDATE DEVICE SESSION`

				updateSession(query, (err, res) => {
					if (err) {
						callback(err)
					} else {
						callback(null, data)
					}
				})
			}
		], function (err, res) {
			if (err) {
				payloadLog.info = `${payloadLog.info} : ERROR`;
				payloadLog.level = { error : true }
				payloadLog.message = payloadLog.message +
									 `\n${JSON.stringify(err)}`;

				fnOutput.insert(req, res, payloadLog)
				
				return callback(err, res)
			};

			fnOutput.insert(req, res, payloadLog)

			return callback(null, res);
		})
	});
	// Disconnect Device
	socket.on('disconnect', function (reason) {
		payloadLog = {}
		req.event = `disconnect`
		payloadLog.info = `SOCKET DISCONNECTED`
		payloadLog.level = { error : false }
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nREASON : ${reason}`
		 
		async.waterfall([
			function (callback) {
				payloadLog.message = payloadLog.message +
									 `\n> REMOVE SESSION`

				DeviceSession.findOneAndDelete({ session_id: socket.id }, (err, res) => {
					if (err) return callback(err)

					if (res) {
						callback(null, { device_id: res.device_id })
					} else {
						return callback(`SESSION NOT FOUND`);
					}
				})
			},

			function (device, callback) {
				query.update = { is_connected: 0 };
				query.find = { where: device };

				Device.findOne(query.find).then((res) => {
					device = {
						device_id: res.device_id,
						device_name: res.device_name,
						user_id: res.user_id,
					}
					
					Device.update(query.update, query.find).then((res) => {
						callback(null, device);
					})
				}).catch((err) => {
					return callback(err);
				});
			},

			function (device, callback) {
				User.findOne({ where : { user_id: device.user_id } }).then((user) => {
					callback(null, {
						device_id: device.device_id,
						device_key: user.device_key
					})
				}).catch((err) => {
					return callback(err);
				});
			},

			function (device, callback) {
				let params = {
					'url'	: 'https://fcm.googleapis.com/fcm/send',
					'notif'	: {
						'title'	: 'Device Disconnected',
						'body'	: `Device ID ${device.device_id} disconnected at ${vascommkit.time.now()}`
					},
					'data'	: {
						'device_id' : `${device.device_id}`,
						'device_key' : `${device.device_key}`
					},
					'auth' : { 'Authorization': 'key=AAAApNlKMJk:APA91bH2y94mcN6soiTrMJzZf7t52eiR4cRfUdoNA7lIeCWU_BkzGHApidOHIK5IHfIH_80v_BJ8JfJXPvi1xIUJZjptYKQ56Qu8wxojxDlNxeMbj9SVRm6jwBUjGhQRcskAbLqfcqPZ' }
				}

				fnRequest.sendNotif(params, (err, res) => {
					if (err) return callback(err);

					payloadLog.message = payloadLog.message +
									 `\n> PUSH NOTIFICATION`

					callback(null, res)
				})
			}
		], (err, res) => {
			if (err) {
				payloadLog.info = `${payloadLog.info} : ERROR`;
				payloadLog.level = { error : true }
				payloadLog.message = payloadLog.message +
									 `\n${JSON.stringify(err)}`;

				return fnOutput.insert(req, err, payloadLog)							 
			}

			return fnOutput.insert(req, res, payloadLog)
		})
	});
	socket.on('error', function (err) {
		payloadLog = {}
		req.event = `error`
		payloadLog.info = 'SOCKET ERROR';
		payloadLog.level = { error : true };
		payloadLog.message = JSON.stringify(err);

		return fnOutput.insert(req, err, payloadLog)
	});
	// Sensor Data
	socket.on('sensordata', function (params, callback) {
		let log = {}
		req.event = `sensordata`
		log.body = req.body = params;
		log.info = 'SENSORDATA';
		log.level = { error : false };
		log.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${params.device_id}`;

		req.APP.db = db

		deviceController.sensordata(req.APP, req, (err, result) => {
			if (err) {
				log.info = `${log.info} : ERROR`;
				log.level = { error : true }
				log.message = log.message +
									 `\n${JSON.stringify(err)}`;

				fnOutput.insert(req, err, log)

				if (params.device_type == '1') {
					return callback(err, result);
				}
			} else {
				fnOutput.insert(req, result, log)

				if (params.device_type == '1') {
					return callback(null, result);
				}
			}
		});
	});
	// Command API
	socket.on('commandapi', function (params) {
		payloadLog = {}
		req.event = `commandapi`
		payloadLog.body = req.body = params;
		payloadLog.info = 'COMMANDAPI';
		payloadLog.level = { error : false };
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${params.device_id}`;

		DeviceSession.findOne({ device_id : params.device_id }).then((result) => {
			io.to(result.session_id).emit('command', params);

			return fnOutput.insert(req, result, payloadLog)
		}).catch((err) => {
			payloadLog.info = `${payloadLog.info} : ERROR`;
			payloadLog.level = { error : true }
			payloadLog.message = payloadLog.message +
									`\n${JSON.stringify(err)}`;

			return fnOutput.insert(req, err, payloadLog)
		});
	});
	// Command Panel
	socket.on('commandpanel', function (params, callback) {
		payloadLog = {}
		req.event = `commandpanel`
		payloadLog.body = req.body = params;
		payloadLog.info = 'COMMANDPANEL';
		payloadLog.level = { error : false };
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${params.device_id}`;

		deviceController.commandpanel(req.APP, req, (err, result) => {
			if (err) {
				payloadLog.info = `${payloadLog.info} : ERROR`;
				payloadLog.level = { error : true }
				payloadLog.message = payloadLog.message +
									 `\n${JSON.stringify(err)}`;

				fnOutput.insert(req, err, payloadLog)

				return callback(err, result);
			} else {
				fnOutput.insert(req, result, payloadLog)

				return callback(null, result);
			}
		});
	});
	// Command Voice
	socket.on('command-voice', function (params) {
		payloadLog = {}
		req.event = `command-voice`
		payloadLog.body = req.body = params;
		payloadLog.info = 'COMMANDVOICE';
		payloadLog.level = { error : false };
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${params.device_id}`;

		DeviceSession.findOne({ device_id : params.device_id }).then((result) => {
			payloadLog.message = payloadLog.message +
								 `\n> SENDING COMMANDVOICE TO ${result.device_id}`
			
			io.to(result.session_id).emit('command', params);

			return fnOutput.insert(req, result, payloadLog)
		}).catch((err) => {
			payloadLog.info = `${payloadLog.info} : ERROR`;
			payloadLog.level = { error : true }
			payloadLog.message = payloadLog.message +
									`\n${JSON.stringify(err)}`;

			fnOutput.insert(req, err, payloadLog)
		});
	})
	// Response Command
	socket.on('res-command', function (params) {
		payloadLog = {}
		req.event = `res-command`
		payloadLog.body = req.body = params;
		payloadLog.info = 'RES-COMMAND';
		payloadLog.level = { error : false };
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${params.device_id}`;

		query.value = { switch : params.switch };
		query.options = {
			where : {
				device_id : params.device_id
			}
		};

		Device.update(query.value, query.options).then((resDevice) => {
			if (resDevice > 0) {
				payloadLog.message = payloadLog.message +
									 `\n> SWITCH UPDATED`
			} else {
				payloadLog.message = payloadLog.message +
									 `\n> SWITCH NOT UPDATED`
			}

			return fnOutput.log(payloadLog, resDevice);
		}).catch((err) => {
			payloadLog.info = `${payloadLog.info} : ERROR`;
			payloadLog.level = { error : true }
			payloadLog.message = payloadLog.message +
									`\n${JSON.stringify(err)}`;

			fnOutput.log(payloadLog)
		});
	});
	// Update Pin Name
	socket.on('update-pin', function (params) {
		payloadLog = {}
		req.event = `update-pin`
		payloadLog.body = req.body = params;
		payloadLog.info = 'UPDATE PIN';
		payloadLog.level = { error : false };
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nGET PIN NAME`;

		DeviceSession.findOne({ device_id : params.device_id }).then((resultSession) => {
			query = {
				sql : {
					where: { device_id : params.device_id },
					attributes: [ 'pin', 'device_name' ]
				}
			}
			
			if (resultSession) {
				DevicePIN.findAll(query.sql).then( (result) => {
					io.to(resultSession.session_id).emit('sync-pin', result);
				})
			}
			
			return fnOutput.insert(req, null, payloadLog)
		}).catch((err) => {
			payloadLog.info = `${payloadLog.info} : ERROR`;
			payloadLog.level = { error : true }
			payloadLog.message = payloadLog.message +
									`\n${JSON.stringify(err)}`;

			return fnOutput.insert(req, err, payloadLog)
		});
	})
});

http.listen(process.env.SOCKET_PORT, function() {
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
		chalk.blue(`///// SOCKET RUNNING ON PORT:${process.env.SOCKET_PORT} /////`) + '\n'
	);
});