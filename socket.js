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

async.waterfall([
	function initializeModels (callback) {
		model(db, (err, result) => {
			if (err) {
				if (err) return console.error(err);
			} else {
				req.app.models = result;

				callback(null, true);
			}
		});
	}
], (err, result) => {
	if (err) {
		if (err) return console.error(`===== SOCKET_ERR ${err} =====`);
	}
});

/**
 * SOCKET ON
 */
const Device = require('./models/device.js')(db.sequelize, db.Sequelize);
const deviceController = require('./controllers/deviceController.js');
const DeviceSession = require('./models/mongo/device_session.js')(db.mongo);

let query = {};

io.on('connection', (socket) => {
	// Handshake Device
	socket.on('handshake', (device) => {
		console.log(`===== SOCKET_ID ${socket.id} | DEVICE_ID ${device.device_id} CONNECTED =====`);

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
			function (callback) {
				Device.findOne(query.sql).then((res) => {
					if (res) {
						callback(null, res);

						return null;
					} else {
						callback(`Device_ID ${device.device_id} Not Registered`);
					}
				}).catch((err) => {
					callback(err);
				});
			},

			function (data, callback) {
				Device.update({ is_connected : 1 }, query.sql).then((result) => {
					callback(null, result);
				}).catch((err) => {
					callback(err);
				});
			},

			function (data, callback) {
				DeviceSession.find(query.mongo.find).then((result) => {				
					if (result.length) {
						DeviceSession.updateOne(query.mongo.find, query.mongo.update, function (err, session) {});
					} else {
						DeviceSession.create(query.mongo.create, function (err, session) {});
					}

					callback(null, true);
				}).catch((err) => {
					callback(err);
				});
			},

		], function (err, res) {
			if (err) return console.error(`===== SOCKET_ERR ${err} =====`);
		});
	});
	// Disconnect Device
	socket.on('disconnect', function () {
		console.log(`===== SOCKET_ID ${socket.id} DISCONNECTED =====`);
		
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
	// Check Device
	socket.on('checkdevice', (params, callback) => {
		console.log(`========== SOCKET CHECKDEVICE | DEVICE_ID ${params.device_id} ==========`);

		req.app.db = db;
		req.body = params;

		deviceController.regischeck(req.app, req, (err, result) => {
			if (err) return callback(err, result);

			switch (result.message) {
				case '1':
					console.log(`========== DEVICE_IP ${params.device_id} NOT MATCH ==========`);
					
					deviceController.ipupdate(req.app, req, (err, result) => {
						if (err) return callback(err, result);
			
						return callback(null, result);
					});
					break;
				
				case '2':
					console.log(`========== DEVICE_ID ${params.device_id} NOT REGISTERED ==========`);

					deviceController.registerdevice(req.app, req, (err, result) => {
						if (err) return callback(err, result);
			
						return callback(null, result);
					});

					break;

				default:
					return callback(null, { code: 'OK' });
			}
		});
	});
	// Sensor Data
	socket.on('sensordata', function (params, callback) {
		console.log(`========== SOCKET SENSORDATA | DEVICE_ID ${params.device_id} ==========`);
		console.log(params);
		console.log(`=======================================================================`);

		req.app = { db : db };
		req.body = params;

		if (req.app.models) {
			deviceController.sensordata(req.app, req, (err, result) => {
				if (err) return callback(err, result);
	
				return callback(null, result);
			});
		}
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

		if (req.app.models) {
			deviceController.commandpanel(req.app, req, (err, res) => {
				if (err) return callback(err, result);
	
				return callback(null, result);
			});
		}
		
	});
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
});

http.listen(process.env.SOCKET_PORT, function() {
    return console.log(`Bismillah, Semoga Lancar. Socket ${process.env.SERVICE_NAME} Listen on Port ${process.env.SOCKET_PORT}`);
});