/**
 * SETUP DEPENDENCIES
 */

const environment = require('./app.json').env;
require('env2')('.env.' + environment);
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const async = require('async');
const chalk = require('chalk');

const db = require('./config/db.js'),
	  model = require('./config/model.js'),
	  fnOutput = require('./functions/output.js');

var output = {};
var req = {};
req.app = {};

/**
 * SOCKET ON
 */
const Device = require('./models/device.js')(db.sequelize, db.Sequelize);
const DevicePIN = require('./models/device_pin.js')(db.sequelize, db.Sequelize);
const deviceController = require('./controllers/deviceController.js');
const DeviceSession = require('./models/mongo/device_session.js')(db.mongo);

var payloadLog = {},
	query = {};

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

	/*DeviceSession.find(query.mongo.find).then((result) => {				
		if (result.length) {
			DeviceSession.updateOne(query.mongo.find, query.mongo.update, function (err, session) {});
		} else {
			DeviceSession.create(query.mongo.create, function (err, session) {});
		}

		callback(null, result);
	}).catch((err) => {
		callback(err);
	});*/
}

io.on('connection', (socket) => {
	payloadLog.info = `CONNECTION ESTABILISHED`
	payloadLog.level = { error : false }
	payloadLog.message = `SOCKET ID : ${socket.id}`
	
	fnOutput.log(payloadLog)
	
	// Handshake Device
	socket.on('handshake', (device, callback) => {
		payloadLog.info = `DEVICE HANDSHAKE`
		payloadLog.body = req.body = device
		payloadLog.level = { error : false }
		payloadLog.message = payloadLog.message +
							 `\nDEVICE ID : ${device.device_id}`

		req.app.db = db;

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
			function initializeModels(callback) {
				payloadLog.message = payloadLog.message +
									 `\n> INITIALIZE MODEL`

				model(db, (err, result) => {
					if (err) {
						callback(err);
					} else {
						req.app.models = result;
		
						callback(null, true);
					}
				});
			},

			function checkDevice(data, callback) {
				payloadLog.message = payloadLog.message +
									 `\n> CHECK DEVICE`
									 
				deviceController.regischeck(req.app, req, (err, result) => {
					if (err) { 
						callback(err); 
					} else {
						switch (result.message) {
							case '1':
								payloadLog.message = payloadLog.message + ' : DEVICE_IP NOT MATCH'
								
								deviceController.ipupdate(req.app, req, (err, result) => {
									if (err) {
										callback(err, result);
									} else {
										callback(null, result);
									}
								});
								break;
							
							case '2':
								payloadLog.message = payloadLog.message + ' : DEVICE_ID NOT REGISTERED'

								deviceController.registerdevice(req.app, req, (err, result) => {
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
				payloadLog.message = payloadLog.message +
									 `\n> UPDATE DEVICE STATUS`

				Device.update({ is_connected : 1 }, query.sql).then((result) => {
					callback(null, data);
				}).catch((err) => {
					callback(err);
				});
			},

			function updateDeviceSession(data, callback) {
				payloadLog.message = payloadLog.message +
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
				payloadLog.message = payloadLog.message +
									 `\n> GET PIN NAME`

				query.sql.attributes = [ 'pin', 'device_name' ]

				DevicePIN.findAll(query.sql).then( (result) => {
					callback(null, result)
				})
			}

		], function (err, res) {
			if (err) {
				payloadLog.info = `${payloadLog.info} : ERROR`;
				payloadLog.level = { error : true }
				payloadLog.message = payloadLog.message +
									 `\n${JSON.stringify(err)}`;

				fnOutput.log(payloadLog)

				return callback(err, res);
			}
			fnOutput.log(payloadLog, res)

			return callback(null, res);
		});
	});
	// Handshake Hub
	socket.on('handshake-hub', (hub, callback) => {
		payloadLog.info = `HANDSHAKE HUB`
		payloadLog.body = req.body = device
		payloadLog.level = { error : false }
		payloadLog.message = payloadLog.message +
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
		], function (err, result) {
			if (err) {
				payloadLog.info = `${payloadLog.info} : ERROR`;
				payloadLog.level = { error : true }
				payloadLog.message = payloadLog.message +
									 `\n${JSON.stringify(err)}`;

				fnOutput.log(payloadLog)
				
				return callback(err, result)
			};

			fnOutput.log(payloadLog, result)

			return callback(null, result);
		})
	})
	// Disconnect Device
	socket.on('disconnect', function (reason) {
		payloadLog.info = `SOCKET DISCONNECTED`
		payloadLog.level = { error : true }
		payloadLog.level = { error : false }
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\n${reason}`
		
		async.waterfall([
			function (callback) {
				payloadLog.message = payloadLog.message +
									 `\n> REMOVE SESSION`

				DeviceSession.findOne({ session_id : socket.id }).then((result) => {
					if (result) {
						query.mongo = {
							find : { device_id : result.device_id },
							update : { status: 0 }
						};

						callback(null, query.mongo);
					} else {
						callback(`SESSION NOT FOUND`);
					}
				}).catch((err) => {
					callback(err);
				});
			},

			function (data, callback) {
				query.update = { is_connected : data.update.status };
				query.find = {
					where : { device_id : data.find.device_id } 
				};
		
				Device.update(query.update, query.find).then((res) => {
					callback(null, res);
				}).catch((err) => {
					callback(err);
				});
			}
		], function (err, res) {
			if (err) {
				payloadLog.info = `${payloadLog.info} : ERROR`;
				payloadLog.level = { error : true }
				payloadLog.message = payloadLog.message +
									 `\n${JSON.stringify(err)}`;

				return fnOutput.log(payloadLog)									 
			}

			return fnOutput.log(payloadLog, res)
		});
	});
	socket.on('error', function (err) {
		payloadLog.info = 'SOCKET ERROR';
		payloadLog.level = { error : true };
		payloadLog.message = JSON.stringify(err);

		return fnOutput.log(payloadLog)
	})
	// Sensor Data
	socket.on('sensordata', function (params, callback) {
		payloadLog.body = req.body = params;
		payloadLog.info = 'SENSORDATA';
		payloadLog.level = { error : false };
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${params.device_id}`;

		req.app = { db : db };

		deviceController.sensordata(req.app, req, (err, result) => {
			if (err) {
				payloadLog.info = `${payloadLog.info} : ERROR`;
				payloadLog.level = { error : true }
				payloadLog.message = payloadLog.message +
									 `\n${JSON.stringify(err)}`;

				fnOutput.log(payloadLog)

				return callback(err, result);
			} else {
				fnOutput.log(payloadLog, result)

				return callback(null, result);
			}
		});
	});
	// Command API
	socket.on('commandapi', function (params) {
		payloadLog.body = req.body = params;
		payloadLog.info = 'COMMANDAPI';
		payloadLog.level = { error : false };
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${params.device_id}`;

		DeviceSession.findOne({ device_id : params.device_id }).then((result) => {
			io.to(result.session_id).emit('command', params);

			return fnOutput.log(payloadLog, result)
		}).catch((err) => {
			payloadLog.info = `${payloadLog.info} : ERROR`;
			payloadLog.level = { error : true }
			payloadLog.message = payloadLog.message +
									`\n${JSON.stringify(err)}`;

			fnOutput.log(payloadLog)
		});
	});
	// Command Panel
	socket.on('commandpanel', function (params, callback) {
		payloadLog.body = req.body = params;
		payloadLog.info = 'COMMANDPANEL';
		payloadLog.level = { error : false };
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${params.device_id}`;

		req.app = { db : db };

		async.waterfall([
			function (callback) {
				model(db, (err, result) => {
					if (err) {
						callback(err);
					} else {
						req.app.models = result;
		
						callback(null, true);
					}
				});
			},

			function (data, callback) {
				deviceController.commandpanel(req.app, req, (err, res) => {
					if (err) {
						callback(err);
					} else {
						callback(null, res);
					}
				});
			}
		], function (err, result) {
			if (err) {
				payloadLog.info = `${payloadLog.info} : ERROR`;
				payloadLog.level = { error : true }
				payloadLog.message = payloadLog.message +
									 `\n${JSON.stringify(err)}`;

				fnOutput.log(payloadLog)

				return callback(err, result);
			} else {
				fnOutput.log(payloadLog, result)

				return callback(null, result);
			}
		});
	});
	// Command Voice
	socket.on('command-voice', function (params) {
		payloadLog.body = req.body = params;
		payloadLog.info = 'COMMANDVOICE';
		payloadLog.level = { error : false };
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${params.device_id}`;

		DeviceSession.findOne({ device_id : params.device_id }).then((result) => {
			payloadLog.message = payloadLog.message +
								 `\n> SENDING COMMANDVOICE TO ${result.device_id}`
			
			io.to(result.session_id).emit('command', params);

			return fnOutput.log(payloadLog, result)
		}).catch((err) => {
			payloadLog.info = `${payloadLog.info} : ERROR`;
			payloadLog.level = { error : true }
			payloadLog.message = payloadLog.message +
									`\n${JSON.stringify(err)}`;

			fnOutput.log(payloadLog)
		});
	})
	// Response Command
	socket.on('res-command', function (params) {
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
		payloadLog.body = req.body = params;
		payloadLog.info = 'UPDATE PIN';
		payloadLog.level = { error : false };
		payloadLog.message = `SOCKET ID : ${socket.id}` +
							 `\nDEVICE ID : ${params.device_id}` +
							 `\nGET PIN NAME`;

		query.sql.where = { device_id : params.device_id }

		DeviceSession.findOne({ device_id : params.device_id }).then((resultSession) => {
			query.sql.attributes = [ 'pin', 'device_name' ]

			DevicePIN.findAll(query.sql).then( (result) => {
				io.to(resultSession.session_id).emit('sync-pin', result);
			})
			
			return fnOutput.log(payloadLog, resultSession)
		}).catch((err) => {
			payloadLog.info = `${payloadLog.info} : ERROR`;
			payloadLog.level = { error : true }
			payloadLog.message = payloadLog.message +
									`\n${JSON.stringify(err)}`;

			fnOutput.log(payloadLog)
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