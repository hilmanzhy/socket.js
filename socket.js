/**
 * SETUP DEPENDENCIES
 */

const environment = require('./app.json').env;
require('env2')('.env.' + environment);
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const async = require('async');

const db = require('./config/db.js');
const model = require('./config/model.js');

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

let query = {};

async function updateSession(query, callback) {
	DeviceSession.updateOne(
		query.mongo.find,
		{ $set : query.mongo.update },
		{ upsert : true },
	    function(err, result){
	        if (err){
				callback(err);
	        }else{
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
	console.log(`SOCKET ID ${socket.id} CONNECTED`)
	// Handshake Device
	socket.on('handshake', (device, callback) => {
		console.log(`===== SOCKET_ID ${socket.id} | DEVICE_ID ${device.device_id} CONNECTED =====`);

		req.app.db = db;
		req.body = device;

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
				console.log(`..... HANDSHAKE INITIALIZE MODEL .....`)
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
				console.log(`..... HANDSHAKE CHECK DEVICE .....`)

				deviceController.regischeck(req.app, req, (err, result) => {
					if (err) { 
						callback(err); 
					} else {
						switch (result.message) {
							case '1':
								console.log(`========== DEVICE_IP ${device.device_id} NOT MATCH ==========`);
								
								deviceController.ipupdate(req.app, req, (err, result) => {
									if (err) {
										callback(err, result);
									} else {
										callback(null, result);
									}
								});
								break;
							
							case '2':
								console.log(`========== DEVICE_ID ${device.device_id} NOT REGISTERED ==========`);
			
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
				console.log(`..... HANDSHAKE UPDATE DEVICE STATUS .....`)

				Device.update({ is_connected : 1 }, query.sql).then((result) => {
					callback(null, data);
				}).catch((err) => {
					callback(err);
				});
			},

			function updateDeviceSession(data, callback) {
				console.log(`..... HANDSHAKE UPDATE DEVICE SESSION .....`)

				updateSession(query, (err, res) => {
					if (err) {
						callback(err)
					} else {
						callback(null, data)
					}
				})
			},

			function getPinName(data, callback) {
				console.log(`..... HANDSHAKE GET PIN NAME .....`)

				query.sql.attributes = [ 'pin', 'device_name' ]

				DevicePIN.findAll(query.sql).then( (result) => {
					callback(null, result)
				})
			}

		], function (err, res) {
			if (err) {
				console.error(`===== SOCKET_ERR =====`);
				console.error(err);
				console.error(`===== ========== =====`);

				return callback(err, res);
			}

			return callback(null, res);
		});
	});
	// Handshake Hub
	socket.on('handshake-hub', (hub, callback) => {
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
				console.log(`===== HANDSHAKE HUB ${socket.id} CONNECTED =====`);
				
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
				console.log(`..... HANDSHAKE UPDATE HUB SESSION .....`)

				updateSession(query, (err, res) => {
					if (err) {
						callback(err)
					} else {
						callback(null, data)
					}
				})
			}
		], function (err, result) {
			if (err) return callback(err, result);

			return callback(null, result);
		})
	})
	// Disconnect Device
	socket.on('disconnect', function (reason) {
		console.log(`===== SOCKET_ID ${socket.id} DISCONNECTED =====`);
		console.log(reason);
		
		async.waterfall([
			function (callback) {
				DeviceSession.findOne({ session_id : socket.id }).then((result) => {
					if (result) {
						query.mongo = {
							find : { device_id : result.device_id },
							update : { status: 0 }
						};
	
						callback(null, query.mongo);
					} else {
						callback(`Session Not Found`);
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
			if (err) return console.error(err);
		});
	});
	socket.on('error', function (err) {
		console.log(`===== SOCKET_ERR =====`);
		console.error(err);
		console.log(`===== ========== =====`);
	})
	// Sensor Data
	socket.on('sensordata', function (params, callback) {
		console.log(`========== SOCKET SENSORDATA | DEVICE_ID ${params.device_id} ==========`);
		console.log(params);
		console.log(`=======================================================================`);

		req.app = { db : db };
		req.body = params;

		deviceController.sensordata(req.app, req, (err, result) => {
			if (err) return callback(err, result);

			return callback(null, result);
		});
	});
	// Command API
	socket.on('commandapi', function (params) {
		console.log(`========== SOCKET COMMANDAPI ==========`);
		console.log(params);
		console.log(`========== ================= ==========`);

		DeviceSession.findOne({ device_id : params.device_id }).then((result) => {
			io.to(result.session_id).emit('command', params);
		}).catch((err) => {
			output.err = {
				"code": "SOCKET_ERR",
				"message": err
			};

			console.error(output.err);
		});
	});
	// Command Panel
	socket.on('commandpanel', function (params, callback) {
		console.log(`========== SOCKET COMMANDPANEL | DEVICE_ID ${params.device_id} ==========`);
		console.log(params);
		console.log(`=======================================================================`);

		req.app = { db : db };
		req.body = params;

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
			if (err) return callback(err, result);

			return callback(null, result);
		});
	});
	// Command Voice
	socket.on('command-voice', function (params) {
		console.log(`========== SOCKET COMMANDVOICE ==========`);
		console.log(params);
		console.log(`========== =================== ==========`);

		DeviceSession.findOne({ device_id : params.device_id }).then((result) => {
			console.log(`..... SENDING COMMANDVOICE TO ${result.device_id} .....`);

			io.to(result.session_id).emit('command', params);
		}).catch((err) => {
			output = {
				"code": "SOCKET_ERR",
				"message": err
			};

			console.error(output);
		});
	})
	// Response Command
	socket.on('res-command', function (params) {
		console.log(`========== SOCKET RES-COMMAND ==========`);
		console.log(params);
		console.log(`========== ================== ==========`);

		query.value = { switch : params.switch };
		query.options = {
			where : {
				device_id : params.device_id
			}
		};

		Device.update(query.value, query.options).then((resDevice) => {
			output.code = `OK`;

			if (resDevice > 0) {
				output.message = `Switch updated`;
			} else {
				output.message = `Switch not updated`;
			}

			return console.log(output);
		}).catch((err) => {
			output = {
				code : `GENERAL_ERR`,
				message : err
			};

			return console.error(output);
		});
	});
	// Update Pin Name
	socket.on('update-pin', function (params) {
		console.log(`..... GET PIN NAME .....`)

		query.sql.where = { device_id : params.device_id }

		DeviceSession.findOne({ device_id : params.device_id }).then((resultSession) => {
			query.sql.attributes = [ 'pin', 'device_name' ]

			DevicePIN.findAll(query.sql).then( (result) => {
				io.to(resultSession.session_id).emit('sync-pin', result);
			})
		}).catch((err) => {
			output.err = {
				code: "SOCKET_ERR",
				message: err
			};

			console.error(output.err);
		});
	})
});

http.listen(process.env.SOCKET_PORT, function() {
    return console.log(`Bismillah, Semoga Lancar. Socket ${process.env.SERVICE_NAME} Listen on Port ${process.env.SOCKET_PORT}`);
});