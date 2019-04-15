/**
 * SETUP DEPENDENCIES
 */

const environment = require('./app.json').env;
require('env2')('.env.' + environment);
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const async = require('async');

const db = require('./config/db.js');

var req = {};

/**
 * SOCKET ON
 */
const Device = require('./models/device.js')(db.sequelize, db.Sequelize)
const DeviceSession = require('./models/mongo/device_session.js')(db.mongo);

let query = {}

io.on('connection', (socket) => {
	// Handshake Device
	socket.on('handshake', (device) => {
		console.log(`===== SOCKET_ID ${socket.id} | DEVICE_ID ${device.device_id} CONNECTED =====`)

		query.sql = {
			where : { device_id : device.device_id },
			attributes : [ 'device_id' ]
		}

		query.mongo = {
			find : { device_id : device.device_id },
			update : { session_id : socket.id },
			create : {
				device_id : device.device_id,
				session_id : socket.id,
			}
		}

		async.waterfall([
			function (callback) {
				Device.findOne(query.sql).then((res) => {
					if (res) {
						callback(null, res);

						return null;
					} else {
						callback(`Device_ID ${device.device_id} Not Registered`)
					}
				}).catch((err) => {
					callback(err)
				})
			},

			function (data, callback) {
				Device.update({ is_connected : 1 }, query.sql).then((result) => {
					callback(null, result)
				}).catch((err) => {
					callback(err)
				})
			},

			function (data, callback) {
				DeviceSession.find(query.mongo.find).then((result) => {				
					if (result.length) {
						DeviceSession.updateOne(query.mongo.find, query.mongo.update, function (err, session) {});
					} else {
						DeviceSession.create(query.mongo.create, function (err, session) {});
					}

					callback(null, true)
				}).catch((err) => {
					callback(err)
				})				
			},

			
		], function (err, res) {
			if (err) return console.log(`===== SOCKET_ERR ${err} =====`)
		})
	})
	// Disconnect Device
	socket.on('disconnect', function () {
		console.log(`===== SOCKET_ID ${socket.id} DISCONNECTED =====`)
		
		async.waterfall([
			function (callback) {
				DeviceSession.findOne({ session_id : socket.id }).then((result) => {
					query.mongo = {
						find : { device_id : result.device_id },
						update : { status: 0 }
					}

					callback(null, query.mongo)
				}).catch((err) => {
					callback(err)
				});
			},

			function (data, callback) {
				query.update = { is_connected : data.update.status }
				query.find = {
					where : { device_id : data.find.device_id } 
				}
		
				Device.update(query.update, query.find).then((res) => {
					callback(null, res)
				}).catch((err) => {
					callback(err)
				})
			}
		], function (err, res) {
			if (err) console.log(err)
		})		
	});
	// Sensor Data
	socket.on('sensordata', function (params) {
		console.log(`===== SOCKET SENSOR DATA =====`)
		console.log(`${params.user_id}`)

		req.app = { db : db }
		req.body = params


		const deviceController = require('./controllers/deviceController.js');

		deviceController.sensordata(req.app, req, (err, result) => {
			if (err) return console.error({
				"status" : 'ERR',
				"message" : err
			})

			return socket.emit('res-sensordata', {
				"status" : 200,
				"params" : result
			})
		})
	});
})

http.listen(process.env.SOCKET_PORT, function() {
    return console.log(`Bismillah, Semoga Lancar. Socket ${process.env.SERVICE_NAME} Listen on Port ${process.env.SOCKET_PORT}`);
});