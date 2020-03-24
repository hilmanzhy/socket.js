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
	  fnRoles = require('./functions/roles.js');
/* MODEL & CONTROLLER */
const Device = require('./models/device.js')(db.sequelize, db.Sequelize),
	  DevicePIN = require('./models/device_pin.js')(db.sequelize, db.Sequelize),
	  User = require('./models/user.js')(db.sequelize, db.Sequelize),
	  DeviceSession = require('./models/mongo/device_session.js')(db.mongo),
	  deviceController = require('./controllers/deviceController.js');
/* DECLARATION */
var output = {},
	query = {},
	APP = {};

/**
 * SOCKET ON
 */
async function updateSession(query, callback) {
	DeviceSession.updateOne(
		query.mongo.find,
		{ $set : query.mongo.update },
		{ upsert : true },
	    function(err, result){
	        if (err) return callback(err);
	        
			callback(null, result);
	    }
	);
}

io.on('connection', (socket) => {
	let log = {}
	log.info = `CONNECTION ESTABILISHED`
	log.level = { error : false }
	log.message = `SOCKET ID : ${socket.id}`
	
	APP.db = db;
	APP.roles = fnRoles;
	APP.request = fnRequest;
	
	model(db, (err, result) => {
		if (err) {
			log.info = `${log.info} : ERROR`;
			log.level = { error : true }
			log.message = log.message + `\n${JSON.stringify(err)}`;
		} else {
			APP.models = result;
			log.message = log.message + `\n> INIT CONNECTION SUCCESS`;
		}

		fnOutput.log(log)
	});


	// Handshake Device
	socket.on('handshake', (device) => {
		let log = {}, req = {};
		req.APP = APP
		req.event = `handshake`
		log.info = `DEVICE HANDSHAKE`
		log.body = req.body = device
		log.level = { error : false }
		log.message = `SOCKET ID : ${socket.id}` +
					  `\nDEVICE ID : ${device.device_id}`

		req.auth = {
			user_id: req.body.user_id
		}

		query.sql = {
			where : { device_id : device.device_id },
			attributes : [ 'device_id' ]
		};
		query.mongo = {
			find : {
				device_id: device.device_id,
				user_id: device.user_id
			},
			update : { session_id : socket.id }
		};

		async.waterfall([
			function checkDevice(callback) {
				log.message = log.message + `\n> CHECK DEVICE`
									 
				deviceController.check(req.APP, req, (err, result) => {
					if (err) return callback(err);

					switch (result.data) {
						case '1':
							log.message = log.message + ' : DEVICE_ID NOT REGISTERED'

							deviceController.register(req.APP, req, (err, result) => {
								if (err) return callback(err, result);
								
								callback(null, result);
							});

							break;
						
						case '2':
							log.message = log.message + ' : DEVICE DELETED' +
														`\nSending Reset Command to Device ID : ${device.device_id}`;

							io.to(socket.id).emit('reset', { reset: '1' });
		
							return callback('DEVICE_DELETED');

						case '3':
							log.message = log.message + ' : DEVICE_IP NOT MATCH'
							
							deviceController.ipupdate(req.APP, req, (err, result) => {
								if (err) return callback(err, result);
								
								callback(null, result);
							});
		
							break;
		
						default:
							callback(null, { code: 'OK' });
					}
				});
			},

			function updateDeviceStatus(data, callback) {
				log.message = log.message + `\n> UPDATE DEVICE STATUS`

				Device.update({ is_connected : 1 }, query.sql).then((result) => {
					callback(null, data);
				}).catch((err) => {
					callback(err);
				});
			},

			function updateDeviceSession(data, callback) {
				log.message = log.message + `\n> UPDATE DEVICE SESSION`

				updateSession(query, (err, res) => {
					if (err) return callback(err)
					
					callback(null, data)
				})
			},

			function getPinName(data, callback) {
				log.message = log.message + `\n> GET PIN NAME`

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
				log.message = log.message + `\n${JSON.stringify(err)}`;

				output = {
					code: 'SOCKET_ERR',
					message: JSON.stringify(err)
				}

				if (err == 'DEVICE_DELETED') output.message = 'Device Deleted'

				fnOutput.insert(req, output, log)

				// if (device.device_type == '1') {
				// 	return callback(err, res);
				// }
			}

			output = {
				code: (res) ? 'FOUND' : 'NOT_FOUND',
				data: JSON.stringify(res)
			}
			
			fnOutput.insert(req, output, log)

			// if (device.device_type == '1') {
			// 	return callback(null, res);
			// }

			return;
		});
	});
	// Handshake Hub
	socket.on('handshake-hub', (hub, callback) => {
		let log = {}, req = {};
		req.APP = APP
		req.event = `handshake-hub`
		log.info = `HANDSHAKE HUB`
		log.body = req.body = device
		log.level = { error : false }
		log.message = `SOCKET ID : ${socket.id}` + `\nDEVICE ID : ${device.device_id}`

		query.sql = {
			where : { device_id : hub.device_id },
			attributes : [ 'device_id' ]
		};
		query.mongo = {
			find : { device_id : hub.device_id },
			update : { session_id : socket.id }
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
				log.message = log.message + `\n> UPDATE DEVICE SESSION`

				updateSession(query, (err, res) => {
					if (err) return callback(err)
					
					callback(null, data)
				})
			}
		], function (err, res) {
			if (err) {
				log.info = `${log.info} : ERROR`;
				log.level = { error : true }
				log.message = log.message + `\n${JSON.stringify(err)}`;

				fnOutput.insert(req, res, log)
				
				return callback(err, res)
			};

			fnOutput.insert(req, res, log)

			return callback(null, res);
		})
	});
	// Disconnect Device
	socket.on("disconnect", function(reason) {
        let log = {},
            req = {};
        req.APP = APP;
        req.event = `disconnect`;
        log.info = `SOCKET DISCONNECTED`;
        log.level = { error: false };
        log.message = `SOCKET ID : ${socket.id}` + `\nREASON : ${reason}`;

        async.waterfall(
            [
                function(callback) {
                    log.message = log.message + `\n> REMOVE SESSION`;

                    DeviceSession.findOneAndDelete(
                        { session_id: socket.id },
                        (err, res) => {
                            if (err) return callback(err);

                            if (res) {
                                callback(null, { device_id: res.device_id });
                            } else {
                                return callback(`SESSION DEVICE NOT FOUND`);
                            }
                        }
                    );
                },

                function(device, callback) {
                    query.update = { is_connected: 0 };
                    query.find = { where: device };

                    Device.findOne(query.find)
                        .then(res => {
                            device = {
                                device_id: res.device_id,
                                device_name: res.device_name,
                                user_id: res.user_id
                            };

                            return Device.update(query.update, query.find);
                        })
                        .then(res => {
                            callback(null, device);
                        })
                        .catch(err => {
                            return callback(err);
                        });
                },

                function(device, callback) {
                    req.body = {
                        user_id: device.user_id
                    };
                    User.findOne({ where: req.body })
                        .then(user => {
                            callback(null, {
								user_id: user.user_id,
                                device_id: device.device_id,
								device_key: user.device_key,
								notification: user.notif_device_disconnected
                            });
                        })
                        .catch(err => {
                            return callback(err);
                        });
                },

                function(data, callback) {
					// Notif Disconnect
					if (data.notification == 1) {
						let params = {
							notif: {
								title: "Device Disconnected",
								body: `Device ID ${
									data.device_id
								} disconnected at ${vascommkit.time.now()}`,
								tag: data.device_id
							},
							data: {
								user_id: data.user_id,
								device_id: data.device_id,
								device_key: data.device_key
							}
						};

						APP.request.sendNotif(APP.models, params, (err, res) => {
							if (err) return callback(err);

							log.message =
								log.message + `\n> PUSH NOTIFICATION`;

							callback(null, res);
						});
					} else {
						callback(null, device);
					}
                }
            ],
            (err, res) => {
                if (err) {
                    log.info = `${log.info} : ERROR`;
                    log.level = { error: true };
                    log.message = log.message + `\n${JSON.stringify(err)}`;

                    return fnOutput.insert(req, err, log);
                }

                return fnOutput.insert(req, res, log);
            }
        );
    });
	// Error
	socket.on('error', function (err) {
		let log = {}, req = {};
		req.APP = APP
		req.event = `error`
		log.info = 'SOCKET ERROR';
		log.level = { error : true };
		log.message = JSON.stringify(err);

		return fnOutput.insert(req, err, log)
	});
	// Sensor Data
	socket.on('sensordata', function (params, callback) {
		let log = {}, req = {};
		req.APP = APP
		req.event = `sensordata`
		log.body = req.body = params;
		log.info = 'SENSORDATA';
		log.level = { error : false };
		log.message = `SOCKET ID : ${socket.id}` +
					  `\nDEVICE ID : ${params.device_id}`;

		APP.db = db

		deviceController.sensordata(APP, req, (err, result) => {
			if (err) {
				log.info = `${log.info} : ERROR`;
				log.level = { error : true }
				log.message = log.message + `\n${JSON.stringify(err)}`;

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
		let log = {}, req = {};
		req.APP = APP
		req.event = `commandapi`
		log.body = req.body = params;
		log.info = 'COMMANDAPI';
		log.level = { error : false };
		log.message = `SOCKET ID : ${socket.id}` +
					  `\nDEVICE ID : ${params.device_id}`;

		DeviceSession.findOne({ device_id : params.device_id }).then((result) => {
			io.to(result.session_id).emit('command', params);

			return fnOutput.insert(req, result, log)
		}).catch((err) => {
			log.info = `${log.info} : ERROR`;
			log.level = { error : true }
			log.message = log.message + `\n${JSON.stringify(err)}`;

			return fnOutput.insert(req, err, log)
		});
	});
	// Command Panel
	socket.on('commandpanel', function (params, callback) {
		let log = {}, req = {};
		req.APP = APP
		req.event = `commandpanel`
		log.body = req.body = params;
		log.info = 'COMMANDPANEL';
		log.level = { error : false };
		log.message = `SOCKET ID : ${socket.id}` + `\nDEVICE ID : ${params.device_id}`;

		deviceController.commandpanel(APP, req, (err, result) => {
			if (err) {
				log.info = `${log.info} : ERROR`;
				log.level = { error : true }
				log.message = log.message + `\n${JSON.stringify(err)}`;

				fnOutput.insert(req, err, log)

				if (!params.mini) {
					return callback(err, result);
				}
			} else {
				fnOutput.insert(req, result, log)

				if (!params.mini) {
					return callback(null, result);
				}
			}
		});
	});
	// Command Voice
	socket.on('command-voice', function (params) {
		let log = {}, req = {};
		req.APP = APP
		req.event = `command-voice`
		log.body = req.body = params;
		log.info = 'COMMANDVOICE';
		log.level = { error : false };
		log.message = `SOCKET ID : ${socket.id}` +
					  `\nDEVICE ID : ${params.device_id}`;

		DeviceSession.findOne({ device_id : params.device_id }).then((result) => {
			log.message = log.message + `\n> SENDING COMMANDVOICE TO ${result.device_id}`
			
			io.to(result.session_id).emit('command', params);

			return fnOutput.insert(req, result, log)
		}).catch((err) => {
			log.info = `${log.info} : ERROR`;
			log.level = { error : true }
			log.message = log.message + `\n${JSON.stringify(err)}`;

			fnOutput.insert(req, err, log)
		});
	})
	// Update Pin Name
	socket.on('update-pin', function (params) {
		let log = {}, req = {};
		req.APP = APP
		req.event = `update-pin`
		log.body = req.body = params;
		log.info = 'UPDATE PIN';
		log.level = { error : false };
		log.message = `SOCKET ID : ${socket.id}` +
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
			
			return fnOutput.insert(req, null, log)
		}).catch((err) => {
			log.info = `${log.info} : ERROR`;
			log.level = { error : true }
			log.message = log.message + `\n${JSON.stringify(err)}`;

			return fnOutput.insert(req, err, log)
		});
	})
	// Command Reset
	socket.on('resetapi', function (params) {
		let log = {}, req = {};
		req.APP = APP;
		req.event = `resetapi`
		log.body = req.body = params;
		log.info = 'RESETAPI';
		log.level = { error : false };
		log.message = `SOCKET ID : ${socket.id}`;

		DeviceSession.findOne(params).then(resultSession => {
			if (resultSession) {
				log.message = log.message + `\nSending Reset Command to Device ID : ${params.device_id}`;
				
				io.to(resultSession.session_id).emit('reset', { reset: '1' });

				return fnOutput.insert(req, resultSession, log)
			}
		}).catch((err) => {
			log.info = `${log.info} : ERROR`;
			log.level = { error : true }
			log.message = log.message + `\n${JSON.stringify(err)}`;

			return fnOutput.insert(req, err, log)
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