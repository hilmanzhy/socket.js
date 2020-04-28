"use strict";

const async = require('async');
const md5 = require('md5');
const unirest = require('unirest');
const sequelize = require('sequelize');
const io = require('socket.io-client');
const vascommkit = require('vascommkit');
const moment = require('moment');

const request = require('../functions/request.js');

const Device = APP => APP.models.mysql.device
const User = APP => APP.models.mysql.user

let socket = io(process.env.SOCKET_URL);
var query = {};

function updateSaklar(Sequelize, params, callback) {
	Sequelize.query('CALL `sitadev_iot_2`.`update_saklar`(:user_id, :device_id, :switch, :user_id_shared, :share_device);', {
		replacements: params,
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
}

function deleteShareUser(Sequelize, params, callback) {
	var sp = "CALL `sitadev_iot_2`.`delete_shared_device`(:device_id, :user_shared);";
	Sequelize.query(sp, {
		replacements: params,
		type: Sequelize.QueryTypes.RAW
	})
	.then((rows) => {
		if (rows[0].message == 0) {
			callback(null, {
				code : '01',
				error : 'true',
				message : 'Delete share user failed'
			});
		} else {
			callback(null, {
				code : 'OK',
				error : 'false',
				message : 'Delete share user success'
			});
		}
	})
	.catch(err => {
		callback({
			code: "GENERAL_ERR",
			message: JSON.stringify(err)
		});
	});
}

exports.register = function(APP, req, callback) {
    let payloadNotif = {
            notif: {
                title: "Device Registered",
                body: `Your Device ${req.body.device_name} has successfully registered and connected to System`,
                tag: req.body.device_id
            },
            data: {
                device_id: `${req.body.device_id}`
            }
        },
        { notif, data } = payloadNotif;

    async.waterfall(
        [
            // Check Existing
            callback => {
                query = {
                    where: { device_id: req.body.device_id }
                };

                // Check Existing Device
                Device(APP)
                    .findOne(query)
                    .then(resCheck => {
                        if (resCheck) throw new Error("DEVICE_REGISTERED");

                        query = {
                            where: { user_id: req.auth.user_id },
                            attributes: ["notif_device_connected", "device_key"]
                        };

                        // Check Existing User
                        return User(APP).findOne(query);
                    })
                    .then(resUser => {
						if (!resUser) throw new Error("USER_NOT_FOUND");

                        data.user_id = resUser.user_id ? resUser.user_id : null;
                        data.device_key = resUser.device_key ? resUser.device_key : null;
                        data.notif_device_connected = resUser.notif_device_connected
                            ? resUser.notif_device_connected
                            : null;

                        callback(null, true);
                    })
                    .catch(err => {
                        let output;

                        switch (err.message) {
                            case "DEVICE_REGISTERED":
                                output = {
                                    code: "INVALID_REQUEST",
                                    message: "Device already registered!"
                                };
                                break;

                            case "USER_NOT_FOUND":
                                output = {
                                    code: "INVALID_REQUEST",
                                    message: "User not registered!"
                                };
                                break;

                            default:
                                output = {
                                    code: "ERR_DATABASE",
                                    message: err.message
                                };
                                break;
                        }

                        callback(output);
                    });
            },
            // Call SP Creating Device
            (bool, callback) => {
                APP.db.sequelize
                    .query(
                        "CALL sitadev_iot_2.create_devicepin (:device_id, :device_ip, :user_id, :device_name, :date, :pin, :group_id, :device_type, :mac_address)",
                        {
                            replacements: {
                                device_id: req.body.device_id,
                                user_id: req.auth.user_id,
                                device_ip: req.body.device_ip,
                                device_name: req.body.device_name,
                                date: vascommkit.time.now(),
                                pin: req.body.pin,
                                group_id: null,
                                device_type: req.body.device_type,
                                mac_address: req.body.mac_address ? req.body.mac_address : null
                            },
                            type: APP.db.sequelize.QueryTypes.RAW
                        }
                    )
                    .then(responseSP => {
                        callback(null, true);
                    })
                    .catch(errSP => {
                        callback({
                            code: "ERR_DATABASE",
                            message: errSP.message
                        });
                    });
            }
        ],
        (errAsync, resAsync) => {
            if (errAsync) {
                (notif.title = "Device not Registered!"),
                    (notif.body = `Your Device ${req.body.device_name} not successfully registered. Please Try Again!`);
            }

			// Notification Device Register
            if (data.notif_device_connected == 1) {
                APP.request.sendNotif(APP.models, payloadNotif, (err, res) => {
                    if (err) console.log(err);
                    else console.log("EMAIL SENT!");
                });
            }

            errAsync
                ? callback(errAsync)
                : callback(null, {
                      code: "OK",
                      message: "Device Sucessfully Registered"
                  });
        }
    );
};

exports.registerdevice_backup = function (APP, req, callback) {
	
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
			device_id : datareq.device_id
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
				APP.db.sequelize.query('CALL sitadev_iot_2.create_devicepin (:device_id, :device_ip, :user_id, :device_name, :date, :pin, :group_id, :device_type, :mac_address)',
					{ 
						replacements: {
							device_id: datareq.device_id,
							user_id: datareq.user_id,
							device_ip: datareq.device_ip,
							device_name: datareq.device_name,
							date: date,
							pin : datareq.pin,
							group_id: null,
							device_type: datareq.device_type,
							mac_address: datareq.mac_address ? datareq.mac_address : null
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

						// Notif Connect
						APP.roles.can(req, '/notif/connect', (err, permission) => {
							if (err) return callback(err);
							if (permission.granted) {
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
							}
							
						})
						
					
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
						
						// Notif Connect
						APP.roles.can(req, '/notif/connect', (err, permission) => {
							if (err) return callback(err);
							if (permission.granted) {
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
							}
						})

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

exports.getdevice = function(APP, req, callback) {
    // const Device = APP.models.mysql.device;

    // if (req.body.install_date_from && req.body.install_date_to) {
    //     req.body.install_date = {
    //         [APP.db.Sequelize.Op.between]: [
    //             `${req.body.install_date_from}`,
    //             `${req.body.install_date_to} 23:59:59`
    //         ]
    //     };
    // }
    // if (req.body.total_pin_from) {
    //     req.body.number_of_pin = {
    //         ...req.body.number_of_pin,
    //         [APP.db.Sequelize.Op.gte]: req.body.total_pin_from
    //     };
    // }
    // if (req.body.total_pin_to) {
    //     req.body.number_of_pin = {
    //         ...req.body.number_of_pin,
    //         [APP.db.Sequelize.Op.lte]: req.body.total_pin_to
    //     };
    // }

    // delete req.body.install_date_from;
    // delete req.body.install_date_to;
    // delete req.body.total_pin_from;
    // delete req.body.total_pin_to;

    // query.where = { ...req.body, user_id: req.auth.user_id, is_deleted: "0" };
    // query.attributes = { exclude: ["is_deleted", "created_at", "updated_at"] };

	// Device.findAll(query)
	
	var sp = "CALL `sitadev_iot_2`.`get_shared_device`(:user_id, :device_id, :device_ip, :device_name, :device_status, :install_date, :active_date, :offset, :limit, :sort);";

    APP.db.sequelize
        .query(sp, {
            replacements: {
                user_id: req.auth.user_id,
				device_id: req.body.device_id,
				device_ip: req.body.device_ip,
				device_name: req.body.device_name,
				device_status: req.body.device_status,
				install_date: req.body.install_date,
				active_date: req.body.active_date,
				offset: req.body.offset,
				limit: req.body.limit,
				sort: req.body.sort
            },
            type: APP.db.sequelize.QueryTypes.RAW
        })
        .then(result => {
            return callback(null, {
                code: result && result.length > 0 ? "FOUND" : "NOT_FOUND",
                data: result
            });
        })
        .catch(err => {
            return callback({
                code: "ERR_DATABASE",
                data: err.message
            });
        });
};

exports.getpindevice = function(APP, req, callback) {
    // const Device = APP.models.mysql.device,
    //     DevicePIN = APP.models.mysql.device_pin;

    // query.attributes = { exclude: ["created_at", "updated_at"] };
    // query.where = {
    //     user_id: req.auth.user_id,
    //     device_id: req.body.device_id,
    //     is_deleted: "0"
    // };

	// Device.findOne(query)
	var sp = "CALL `sitadev_iot_2`.`get_pin_list`(:user_id, :device_id, :device_ip, :device_name, :device_status, :install_date, :active_date, :offset, :limit, :sort);";

    APP.db.sequelize
        .query(sp, {
            replacements: {
                user_id: req.auth.user_id,
				device_id: req.body.device_id,
				device_ip: req.body.device_ip,
				device_name: req.body.device_name,
				device_status: req.body.device_status,
				install_date: req.body.install_date,
				active_date: req.body.active_date,
				offset: req.body.offset,
				limit: req.body.limit,
				sort: req.body.sort
            },
            type: APP.db.sequelize.QueryTypes.RAW
        })
        // .then(resDevice => {
        //     if (!resDevice) throw new Error("NOT_FOUND");

        //     if (req.body.install_date_from && req.body.install_date_to) {
        //         req.body.install_date = {
        //             [APP.db.Sequelize.Op.between]: [
        //                 `${req.body.install_date_from}`,
        //                 `${req.body.install_date_to} 23:59:59`
        //             ]
        //         };
        //     }

        //     delete req.body.install_date_from;
        //     delete req.body.install_date_to;

        //     query.where = {
        //         ...req.body,
        //         user_id: req.auth.user_id
        //     };

        //     return DevicePIN.findAll(query);
        // })
        .then(resDevicePIN => {
            if (!resDevicePIN) throw new Error("NOT_FOUND");

            return callback(null, {
                code: "FOUND",
                data: resDevicePIN
            });
        })
        .catch(err => {
            if (err.message == "NOT_FOUND")
                return callback(null, { code: "NOT_FOUND" });

            return callback({
                code: "ERR_DATABASE",
                data: err.message
            });
        });
};

exports.activate = function (APP, req, callback) {
	const Device = APP.models.mysql.device,
		User = APP.models.mysql.user,
		DevicePIN = APP.models.mysql.device_pin
	let query, output = {},
		params = req.body

	async.waterfall([
		function generatingQuery(callback) {
			query = {
				value: {
					device_status: params.active_status,
					active_date: (params.active_status == '1') ? vascommkit.time.now() : null
				},
				options: {
					include: 'electricity_pricing',
					where: {
						user_id: req.auth.user_id
					}
				}
			}

			callback(null, query)
		},

		function checkExistingUser(query, callback) {
			User.findOne(query.options).then((resultUser) => {
				let pricing = resultUser.electricity_pricing

				if (params.active_status == '1') {
					if (pricing.meter_type == '2' && !resultUser.token) throw new Error('TOKEN_NULL')
				}
				
				callback(null, query)
			}).catch((err) => {
				switch (err.message) {
					case 'TOKEN_NULL':
						output.code = 'INVALID_REQUEST',
						output.message = 'Please input your token first!'

						break;
				
					default:
						output.code = 'ERR_DATABASE',
						output.message = e.message

						break;
				}
				
				callback(output)
			});
		},

		function checkExistingDevice(query, callback) {
			let { options: { where } } = query
			delete query.options.include
			where.device_id = params.device_id
			
			Device.findOne(query.options).then(resDevice => {
				if (!resDevice) return callback({
					code: 'NOT_FOUND',
					message: 'Device not found!'
				})

				callback(null, query, params.type, params.active_status)
			}).catch(e => {
				return callback({
					code: 'ERR_DATABASE',
					message: JSON.stringify(e)
				})
			})
		},

		function updatingData(query, type, status, callback) {
			if (!(type == '1' && status == '0')) {
				Device.update(query.value, query.options).then(() => { return })
					.catch(e => {
						return callback({
							code: 'ERR_DATABASE',
							message: JSON.stringify(e)
						})
					})
			}

			callback(null, params.type)
		},

		function updatingChildData(type, callback) {
			let { options: { where } } = query

			if (type != '0') {
				if (type == '1') where.pin = params.pin

				DevicePIN.update(query.value, query.options).then(() => { return })
					.catch(e => {
						return callback({
							code: 'ERR_DATABASE',
							message: JSON.stringify(e)
						})
					})
			}

			callback(null, params.active_status)
		},

		function generatingOutput(status, callback) {
			output.code = 'OK'

			switch (status) {
				case '0':
					output.message = 'Deactivate success'
					break;

				case '1':
					output.message = 'Activate success'
					break;
			}

			callback(null, output)
		}
	], (err, res) => {
		if (err) return callback(err)
		if (res) return callback(null, res)
	})
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
			if (!datareq.pin) return callback({
				code: 'MISSING_KEY', data: {
					invalid_parameter: 'pin'
				}
			})

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

exports.devicehistory = function (APP, req, callback) {
	// const DeviceHistory = APP.models.mysql.device_history
	var response = {},
		params = req.body

	// query = {
	// 	attributes : { exclude: ['created_at', 'updated_at'] },
	// 	where : {
	// 		user_id : params.user_id,
	// 		date: {
	// 			[APP.db.Sequelize.Op.between]: [params.date_from, `${params.date_to} 23:59:59`]
	// 		  }
	// 	}
	// }

	// if (params.device_id) query.where.device_id = params.device_id
	// if (params.pin) query.where.pin = params.pin
	
	// var query = "select device_id, device_ip, IFNULL(pin,'-') as pin, device_name, device_type, switch, date from device_history where user_id = '" + params.user_id + "' and date > '" + params.date_from + "' and date < '" + params.date_to + "'"

	// if (params.device_id != '')
	// {
	// 	query = query + " and device_id = '" + params.device_id + "'"
	// }

	// if (params.pin != '')
	// {
	// 	query = query + " and pin = '" + params.pin + "'"
	// }
	
	// APP.db.sequelize.query(query, { type: APP.db.sequelize.QueryTypes.SELECT})
	
	// .then(device => {

	var sp = "CALL `sitadev_iot_2`.`get_shared_device_history`(:user_id, :device_id, :device_ip, :device_name, :date_from, :date_to, :offset, :limit, :sort);";

	APP.db.sequelize
	.query(sp, {
		replacements: {
			user_id: params.user_id,
			device_id: params.device_id,
			device_ip: params.device_ip,
			device_name: params.device_name,
			date_from: params.date_from,
			date_to: params.date_to,
			offset: params.offset,
			limit: params.limit,
			sort: params.sort
		},
		type: APP.db.sequelize.QueryTypes.RAW
	})
	// .then((device) => {
	// 	let Model = APP.models.mysql.device;
	// 	let data = device.map( history => {
	// 		query = {
	// 			attributes : ['icon_id'],
	// 			raw: true,
	// 			where : {
	// 				user_id : history.user_id,
	// 				device_id : history.device_id
	// 			}
	// 		}
			
	// 		history = history.toJSON();
	// 		history.icon_id = null;

	// 		if (history.pin) {
	// 			Model = APP.models.mysql.device_pin
	// 			query.where.pin = history.pin
	// 		}

	// 		return Model.findOne(query).then((result) => {
	// 			history.icon_id = result.icon_id;

	// 			return history;
	// 		}).catch((err) => {
	// 			throw new Error(err)
	// 		});
	// 	})

	// 	return Promise.all(data)
	// })
	.then((data) => {
		response = {
			code : (data && (data.length > 0)) ? 'FOUND' : 'NOT_FOUND',
			data : data
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
									APP.db.sequelize.query('CALL sitadev_iot_2.cek_saklar_pin (:user_id, :device_id, :user_id_shared, :share_device)',
										{ 
											replacements: {
												device_id: datareq.device_id,
												user_id: datareq.user_id,
												user_id_shared: '',
												share_device: 0
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
					APP.db.sequelize.query('CALL sitadev_iot_2.update_saklar (:user_id, :device_id, :switch, :user_id_shared, :share_device)',
						{ 
							replacements: {
								user_id_shared: '',
								share_device: 0,
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

exports.sensordata = function(APP, req, callback) {
    let params = req.body,
        User = APP.models.mysql.user,
        DevicePIN = APP.models.mysql.device_pin;

    query.options = {
        where: {
            user_id: params.user_id
        },
        attributes: ["user_id", "device_key", "notif_sensor_status_update"]
    };

    async.waterfall(
        [
            function generatingParams(callback) {
                if (params.device_type == "0") params.pin == "1";

                callback(null, params);
            },

            function updatingSensorStatus(params, callback) {
                User.findOne(query.options)
                    .then(resultUser => {
                        params.user_id = resultUser.user_id;
                        params.device_key = resultUser.device_key;
                        params.notif = resultUser.notif_sensor_status_update;

                        query.options.where.device_id = params.device_id;
                        query.options.where.pin = params.pin;
                        query.value = { sensor_status: params.sensor_status };

                        return DevicePIN.update(query.value, query.options);
                    })
                    .then(updated => {
                        // NOTIF SENSOR UPDATE
                        if (params.sensor_status == '0' && updated[0] > 0 && params.notif == 1) {
                        	let notif = {
                        		'notif': {
                        			'title': 'Sensor Notice',
                        			'body': `Sensor Notice on Device ID ${params.device_id} PIN ${params.pin} at ${vascommkit.time.now()}`,
                        			'tag': params.device_id
                        		},
                        		'data': {
                        			'device_id': `${params.device_id}`,
                        			'device_key': `${params.device_key}`
                        		}
                        	}

                        	request.sendNotif(APP.models, notif, (err, res) => {
								if (err) return callback(err);

                        		console.log(`/ SENDING PUSH NOTIFICATION /`)
                        	})
                        }

                        callback(null, params);
                    });
            },

            function callSP(params, callback) {
                APP.db.sequelize
                    .query(
                        "CALL sitadev_iot_2.datasensor (:device_id, :user_id, :pin, :switch, :current_sensor, :watt, :date_device)",
                        {
                            replacements: {
                                device_id: params.device_id,
                                user_id: params.user_id,
                                pin: params.pin,
                                switch: params.switch,
                                current_sensor: params.ampere,
                                watt: params.wattage,
                                date_device: params.date
                            },
                            type: APP.db.sequelize.QueryTypes.RAW
                        }
                    )
                    .then(rows => {
                        callback(null, {
                            code: "OK",
                            message:
                                rows[0].message == "0"
                                    ? "Device not activated yet"
                                    : "Data saved"
                        });
                        return;
                    })
                    .catch(err => {
                        return callback({
                            code: "ERR_DATABASE",
                            data: err.message
                        });
                    });
            }
        ],
        function(err, result) {
            if (err) return callback(err);

            return callback(null, result);
        }
    );
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

exports.runtimereport = function(APP, req, callback) {
    let date_from,
        date_to,
        sp =
            "CALL sitadev_iot_2.runtimereport (:user_id, :date_from, :date_to)";

    switch (req.body.range) {
        case "WEEKLY":
            date_from = `${moment()
                .startOf("isoWeek")
                .format("YYYY-MM-DD")} 00:00:00`;
            date_to = `${moment()
                .endOf("isoWeek")
                .format("YYYY-MM-DD")} 23:59:59`;

            break;

        default:
            date_from = `${req.body.date_from} 00:00:00`;
            date_to = `${req.body.date_to} 23:59:59`;

            break;
    }

    APP.db.sequelize
        .query(sp, {
            replacements: {
                user_id: req.auth.user_id,
                date_from: date_from,
                date_to: date_to
            },
            type: APP.db.sequelize.QueryTypes.RAW
        })
        .then(result => {
            callback(null, {
                code: result && result.length > 0 ? "FOUND" : "NOT_FOUND",
                data: result
            });
        })
        .catch(err => {
            callback({
                code: "GENERAL_ERR",
                data: JSON.stringify(err)
            });
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

exports.totalruntime = function(APP, req, callback) {
    const Device = APP.models.mysql.device;
    let params = req.body;
    var data = {},
        response = {};

    query = {
        col: "device_status",
        where: {
            device_status: "1",
            user_id: params.user_id
        }
    };

    Device.count(query)
        .then(resultCount => {
            data.active_device = resultCount;

            query.col = "is_connected";
            query.where = {
                user_id: params.user_id,
                is_connected: "1"
            };

            return Device.count(query);
        })
        .then(resultCountConnect => {
			data.connected_device = resultCountConnect;

            return APP.db.sequelize.query(
                "CALL sitadev_iot_2.runtimereport_total (:user_id, :date_from, :date_to)",
                {
                    replacements: {
                        user_id: params.user_id,
                        date_from: params.date_from,
                        date_to: params.date_to
                    },
                    type: APP.db.sequelize.QueryTypes.RAW
                }
            );
        })

        .then(resultSP => {
            data.total_kwh = resultSP[0].total_kwh;
            data.total_harga = resultSP[0].total_harga;
            data.token = resultSP[0].token;

            async.parallel(
                [
                    function validateKWH(cb) {
                        APP.roles.can(req, "/totalruntime/kwh", (err, permission) => {
                            if (err) return cb(err);
                            if (!permission.granted) delete data.total_kwh;

                            cb(null, data);
                        });
                    },

                    function validateCost(cb) {
                        APP.roles.can(req, "/totalruntime/cost", (err, permission) => {
                            if (err) return cb(err);
                            if (!permission.granted) delete data.total_harga;

                            cb(null, data);
                        });
                    },

                    function validateDevice(cb) {
                        APP.roles.can(req, "/totalruntime/device", (err, permission) => {
                            if (err) return cb(err);
                            if (!permission.granted) delete data.active_device;

                            cb(null, data);
                        });
                    },

                    function validateToken(cb) {
                        APP.roles.can(req, "/totalruntime/token", (err, permission) => {
                            if (err) return cb(err);
                            if (!permission.granted) delete data.token;

                            cb(null, data);
                        });
					}
					/**
					 * !NOTE : Belum ada validasi permission untuk count connected device
					 */
                ],
                function(err, res) {
                    if (err)
                        return callback({
                            code: "GENERAL_ERR",
                            message: err
                        });

                    response = {
                        code: res && res.length > 0 ? "FOUND" : "NOT_FOUND",
                        data: {
                            runtime: [
                                {
                                    total_kwh: data.total_kwh,
                                    total_harga: data.total_harga,
                                    token: data.token
                                }
                            ],
                            device: [
                                {
                                    active_device: data.active_device,
                                    connected_device: data.connected_device
                                }
                            ]
                        }
                    };

                    return callback(null, response);
                }
            );
        });
};

exports.totalruntime_range = function(APP, req, callback) {
	let date_from,
        date_to,
        sp =
            "CALL `sitadev_iot_2`.`runtimereport_total_perday`(:user_id, :date_from, :date_to);";

    switch (req.body.range) {
        case "DAILY":
            date_from = `${vascommkit.time.date()} 00:00:00`;
            date_to = `${vascommkit.time.date()} 23:59:59`;

            break;

        case "WEEKLY":
            date_from = `${moment()
                .startOf("isoWeek")
                .format("YYYY-MM-DD")} 00:00:00`;
            date_to = `${moment()
                .endOf("isoWeek")
                .format("YYYY-MM-DD")} 23:59:59`;

            break;

        default:
            date_from = `${req.body.date_from} 00:00:00`;
            date_to = `${req.body.date_to} 23:59:59`;

            break;
    }

    APP.db.sequelize
        .query(sp, {
            replacements: {
                user_id: req.auth.user_id,
                date_from: date_from,
                date_to: date_to
            },
            type: APP.db.sequelize.QueryTypes.RAW
        })
        .then(result => {
            callback(null, {
                code: result && result.length > 0 ? "FOUND" : "NOT_FOUND",
                data: req.body.range == "DAILY" ? result[0] : result
            });
        })
        .catch(err => {
            callback({
                code: "GENERAL_ERR",
                message: JSON.stringify(err)
            });
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

exports.command_backup = function (APP, req, callback) {
	
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

exports.command = function (APP, req, callback) {
	const Device = APP.models.mysql.device,
		DevicePIN = APP.models.mysql.device_pin,
		DeviceHistory = APP.models.mysql.device_history,
		Sequelize = APP.db.sequelize;

	let params = req.body,
		date = new Date()
	date.setHours(date.getHours())

	socket.emit('commandapi', params)

	query.options = {
		where: {
			device_id: params.device_id,
			user_id: params.user_id
		}
	}

	Device.findOne(query.options).then(resDevice => {
		console.log(resDevice.device_id)
		if (!resDevice) return callback({ code: "NOT_FOUND" })
		if (resDevice.is_connected == 0) return callback({ code: "DEVICE_DISCONNECTED" })

		query.insert = {
			user_id: params.user_id,
			device_id: params.device_id,
			switch: params.switch,
			user_id_shared: params.user_id_shared,
			share_device: params.share_device
		}

		if (resDevice.device_type == 0) {
			if (params.share_device == 1) query.insert.user_id = ''
			console.log(`/ COMMAND MINI CCU DEVICE /`)

			updateSaklar(Sequelize, query.insert, (err, response) => {
				if (err) {
					return callback(err)
				} else {
					return callback(null, response)
				}
			})
		} else if (resDevice.device_type == 1) {
			if (!params.mode) return callback({ code: 'MISSING_KEY' })
			if (!params.pin) return callback({ code: 'MISSING_KEY' })
		
			console.log(`/ COMMAND SINGLE CCU DEVICE /`)

			switch (params.mode) {
				case "1":
					console.log(`/...PIN ${params.pin}/`)
	
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

							if (params.share_device == 1) {
								query.insert.user_id = params.user_id_shared
							} else if (params.share_device == 0) {
								query.insert.user_id = params.user_id
							}

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
							var user
							if (params.share_device == 1) user = ''
							if (params.share_device == 0) user = params.user_id

							APP.db.sequelize.query('CALL sitadev_iot_2.cek_saklar_pin (:user_id, :device_id, :user_id_shared, :share_device)', {
								replacements: {
									device_id: params.device_id,
									user_id: user,
									user_id_shared: params.user_id_shared,
									share_device: params.share_device
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

				case "2":
					console.log(`/...ALL PIN.../`)
					if (params.share_device == 1) query.insert.user_id = ''

					updateSaklar(Sequelize, query.insert, (err, response) => {
						if (err) {
							return callback(err)
						} else {
							return callback(null, response)
						}
					})
	
					break;
			}
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

exports.check = function (APP, req, callback) {
	let response = {}, params = req.body,
		Device = APP.models.mysql.device
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	query.options = {
		where : {
			device_id : params.device_id,
			user_id : params.user_id
		}
	}
	
	APP.db.sequelize
        .query("CALL sitadev_iot_2.cek_mac_address (:device_id, :mac_address)", {
            replacements: {
                device_id: params.device_id,
                mac_address: params.mac_address ? params.mac_address : null
            },
            type: APP.db.sequelize.QueryTypes.RAW
        })
        .then(resultSP => {
            // console.log(resultSP)
            // process.exit(1)

            if (resultSP[0].message == "2") return Device.findOne(query.options);

            throw new Error("2"); // Device Deleted
        })
        .then(result => {
            if (!result) throw new Error("1"); // Device ID not Registered

            query.options.where.device_ip = params.device_ip;

            return Device.findAndCountAll(query.options);
        })
        .then(resultIP => {
            if (resultIP.count == "0") throw new Error("3"); // Device IP not Match

            return callback(null, {
                code: "OK",
                message: "Device checked",
                data: "0"
            });
        })
        .catch(e => {
            switch (e.message) {
                case "1":
                    response = {
                        code: "OK",
                        message: "Device ID not Registered",
                        data: "1"
                    };
                    break;

                case "2":
                    response = {
                        code: "OK",
                        message: "Device Deleted",
                        data: "2"
                    };
                    break;

                case "3":
                    response = {
                        code: "OK",
                        message: "Device IP not Match",
                        data: "3"
                    };
                    break;

                default:
                    return callback({
                        code: "DATABASE_ERR",
                        message: e.message
                    });
            }

            return callback(null, response);
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

exports.delete = function (APP, req, callback) {
	const Device = APP.models.mysql.device,
		  DevicePIN = APP.models.mysql.device_pin
	
	var response = {}

	async.waterfall([
		function generatingQuery(callback) {
			query.options = {
				where: {
					user_id: req.body.user_id,
					device_id: req.body.device_id
				}
			}

			callback(null, query)
		},
		function resetDevice(query, callback) {
			module.exports.reset(APP, req, (err, res) => {
				if (err && err.code == 'DEVICE_DISSCONNECTED') {
					response.code = 'SOFT'
				} else if (err) {
					return callback(err)
				} else {
					response.code = 'HARD'
				}

				callback(null, response)
			})
		},
		function deletingData(response, callback) {
			if (response.code == 'SOFT') {
				Device.update({ is_deleted: '1' }, query.options)
				.then( resUpdated => {
					response.code = 'OK'

					if (resUpdated[0] > 0) {
						response.message = 'Success delete device'
					} else {
						response.message = 'Device already deleted'
					}

					return callback(null, response)
				})
			}
			if (response.code == 'HARD') {
				Device.destroy(query.options)
				.then(resultDevice => {
					console.log('resultDevice', resultDevice)

					return DevicePIN.destroy(query.options)
				}).then(resultDevicePIN => {
					console.log('resultDevicePIN', resultDevicePIN)

					callback(null, {
						code: 'OK',
						message: 'Success delete device'
					})
					return
				}).catch((err) => {
					callback({
						code: 'ERR_DATABASE',
						data: JSON.stringify(err)
					})
					return
				});
			}
		}
	], function (err, result) {
		if (err) return callback(err)

		return callback(null, result)
	})
}

exports.reset = function (APP, req, callback) {
	async.waterfall([
		function generatingQuery(callback) {
			query.where = {
				user_id: req.body.user_id,
				device_id: req.body.device_id
			}

			callback(null, query)
			return
		},

		function existingDeviceCheck(query, callback) {
			APP.models.mysql.device.findOne(query).then(resultDevice => {
				if (!resultDevice) return callback({
					code: 'NOT_FOUND',
					message: 'Device Not Found!'
				})
				if (resultDevice.is_connected == 0) return callback({ code: 'DEVICE_DISSCONNECTED' })

				callback(null, query.where)
				return
			}).catch((err) => {
				callback({
					code: 'ERR_DATABASE',
					data: JSON.stringify(err)
				})
				return
			});
		},

		function sendingCommand(query, callback) {
			socket.emit('resetapi', query)

			callback(null, {
				code: 'OK',
				message: 'Reset Device success'
			})
			return
		}
	], function (err, result) {
		if (err) return callback(err)

		return callback(null, result)
	})
}

exports.upgradeFirmware = function(APP, req, callback) {
    let { device_id } = req.body,
        { user_id } = req.auth,
        response = {};

    query = {
        where: { device_id, user_id }
    };

    Device(APP)
        .findOne(query)
        .then(device => {
            if (!device) throw new Error("NOT_FOUND");
            if (device.is_connected != "1") throw new Error("DEVICE_DISCONNECTED");

            socket.emit("upgrade_firmware", {
                device_id: device.device_id,
                firmware_name: "SitamotoDevice_v1.0.zip"
            });

            callback(null, {
                code: "OK",
                message: "Progress upgrade, please wait until your device restarted"
            });

            return;
        })
        .catch(err => {
            switch (err.message) {
                case "NOT_FOUND":
                    response.code = "NOT_FOUND";
                    response.message = "Device not found!";

                    break;

                case "DEVICE_DISCONNECTED":
                    response.code = "DEVICE_DISCONNECTED";

                    break;

                default:
                    (response.code = "GENERAL_ERR"), (response.message = err.message);

                    break;
            }

            callback(response);

            return;
        });
};

// function selectUser(Sequelize, params, callback) {

// }

const authController = require('../controllers/authController.js')
/* Add share user controller */
exports.addshareuser = function(APP, req, callback) {
	let User = APP.models.mysql.user
	async.waterfall([
		function(callback) {
			authController.verifyPassword(APP, req, (err, result) => {
				if (err) return callback(err)

				callback(null, result)
			})
		},
		function(data, callback) {
			query.select = {
				where: {
					username: req.body.shared_id
				},
				attributes: ['device_key', 'name']
			}

			User.findOne(query.select)
				.then(resultUser => {
					callback(null, resultUser)
				})
				.catch(err => {
					callback({
						code: "GENERAL_ERR",
						message: JSON.stringify(err)
					});
				});
		},
		function(resultUser, callback) {
			var querycek = "SELECT * FROM device WHERE device_id = :device_id;";

			APP.db.sequelize
				.query(querycek, {
					replacements: {
						device_id: req.body.device_id
					},
					type: APP.db.sequelize.QueryTypes.SELECT
				})
				.then(resultDevice => {
					callback(null, resultDevice, resultUser)
				})
				.catch(err => {
					callback({
						code: "GENERAL_ERR",
						message: JSON.stringify(err)
					});
				});
		},
		function(resultDevice, resultUser, callback) {
			var sp = "CALL `sitadev_iot_2`.`create_shared_device`(:owner_id, :device_id, :user_shared);";

			APP.db.sequelize
			.query(sp, {
				replacements: {
					owner_id: req.auth.user_id,
					user_shared: req.body.shared_id,
					device_id: req.body.device_id
				},
				type: APP.db.sequelize.QueryTypes.RAW
			})
			.then((rows) => {
				let payload = {
					notif: {
						title: "Share Device",
						body: `${req.auth.username} has been share device ${resultDevice[0].device_name} with you , confirmation if its okay`,
						tag: req.body.device_id
					},
					data: {
						device_key: resultUser.device_key,
						username: req.auth.username,
						user_id: req.auth.user_id,
						device_id: req.body.device_id,
						icon_id: resultDevice[0].icon_id,
						device_name: resultDevice[0].device_name,
						active_date: resultDevice[0].active_date,
						click_action : "SHARE_DEVICE_ACTIVITY"
					}
				}

				if (resultUser.device_key === "") {
					APP.models.mongo.notif.create(
						{
							user_id: req.auth.user_id,
							notification: payload.notif,
							date: moment().format("YYYY-MM-DD"),
							time: moment().format("HH:mm:ss")
						}
					);
				} else {
					APP.request.sendNotif(APP.models, payload, (err, res) => {
						if (err) console.log("push notif error")
						else console.log("push notif berhasil")
					})
				}

				callback(null, {
					code : 'OK',
					error : 'false',
					message : 'Add share user success and saved'
				});
			})
			.catch(err => {
				return callback({
					code: "GENERAL_ERR",
					message: JSON.stringify(err)
				});
			});
		}
	], function (err, result) {
		if (err) return callback(err)

		return callback(null, result)
	})
}

/* Add share user controller */
exports.deleteshareuser = function(APP, req, callback) {
	const Sequelize = APP.db.sequelize
	let User = APP.models.mysql.user

	authController.verifyPassword(APP, req, (err, result) => {
        if (err) return callback(err)

		query.delete = {
			user_shared: req.body.shared_id,
			device_id: req.body.device_id
		}
		deleteShareUser(Sequelize, query.delete, (err, res) => {
			if (err) {
				return callback(err)
			} else {
				query.select = {
					where: {
						user_id: req.auth.user_id
					},
					attributes: ['device_key']
				}
		
				User.findOne(query.select)
					.then(resultUser => {
						let payload = {
							notif: {
								title: "Share Device Deleted",
								body: `Your Device ${req.body.device_id} is deleted`,
								tag: req.body.device_id
							},
							data: {
								device_key: resultUser.device_key,
								user_id: req.auth.user_id,
								device_id: req.body.device_id,
								click_action : "DELETE_SHARE_USER_DEVICE"
							}
						}
	
						if (resultUser.device_key === "") {
							APP.models.mongo.notif.create(
								{
									user_id: req.auth.user_id,
									notification: payload.notif,
									date: moment().format("YYYY-MM-DD"),
									time: moment().format("HH:mm:ss")
								}
							);
						} else {
							APP.request.sendNotif(APP.models, payload, (err, res) => {
								if (err) console.log("push notif error")
								else console.log("push notif berhasil")
							})
						}
					})
					.catch(err => {
						return callback({
							code: "GENERAL_ERR",
							message: JSON.stringify(err)
						});
					})
				return callback(null, res)
			}
		})
	})
};

/* cek username controller */
exports.cekusername = function(APP, req, callback) {
	var querycek = "SELECT username FROM users WHERE username = :username;";

	APP.db.sequelize
        .query(querycek, {
            replacements: {
                username: req.body.username
            },
            type: APP.db.sequelize.QueryTypes.RAW
        })
        .then(result => {
			callback(null, {
				code: result[0].length > 0 ? "FOUND" : "NOT_FOUND",
				data: result[0]
			})
        })
        .catch(err => {
            callback({
                code: "GENERAL_ERR",
                message: JSON.stringify(err)
            });
        });
};

/* get shared user controller */
exports.getshareduser = function(APP, req, callback) {
	let User = APP.models.mysql.user
	async.waterfall([
		// function(callback) {
		// 	query.select = {
		// 		where: {
		// 			username: req.body.username
		// 		},
		// 		attributes: ['phone']
		// 	}

		// 	User.findOne(query.select)
		// 		.then(resultUser => {
		// 			callback(null, resultUser)
		// 		})
		// 		.catch(err => {
		// 			callback({
		// 				code: "GENERAL_ERR",
		// 				message: JSON.stringify(err)
		// 			});
		// 		});
		// },
		function(callback) {
			var sp = "CALL `sitadev_iot_2`.`get_shared_user`(:device_id, :username, :phone);"

			APP.db.sequelize
			.query(sp, {
				replacements: {
					device_id: req.body.device_id,
					username: "",
					phone: ""
				},
				type: APP.db.sequelize.QueryTypes.RAW
			})
			.then(result => {
				console.log(result)
				callback(null, {
					code: result && result.length > 0 ? "FOUND" : "NOT_FOUND",
					data: result
				})
			})
			.catch(err => {
				callback({
					code: "GENERAL_ERR",
					message: JSON.stringify(err)
				});
			});
		}
	], function (err, result) {
		if (err) return callback(err)

		return callback(null, result)
	})
};

/* update status shared user controller */
exports.updatestatusshare = function(APP, req, callback) {
	const Sequelize = APP.db.sequelize;
	let User = APP.models.mysql.user
	
	query.delete = {
		user_shared: req.auth.user_id,
		device_id: req.body.device_id
	}

	authController.verifyPassword(APP, req, (err, result) => {
		if (result) {
			var query_update = "UPDATE shared_device SET status = :status WHERE device_id = :device_id AND shared_id = :shared_id;";

			APP.db.sequelize
			.query(query_update, {
				replacements: {
					status: 1,
					device_id: req.body.device_id,
					shared_id: req.auth.user_id
				},
				type: APP.db.sequelize.QueryTypes.UPDATE
			})
			.then(result => {
				if (result[1] == 1) {
					return callback(null, {
						code : 'OK',
						error : 'false',
						message : 'Update status share user success'
					});
				} else {
					return callback(null, {
						code : '01',
						error : 'true',
						message : 'Update status share user failed'
					});
				}
			})
			.catch(err => {
				return callback({
					code: "GENERAL_ERR",
					message: JSON.stringify(err)
				});
			});
		} else if (err.code == "INVALID_REQUEST") {
			deleteShareUser(Sequelize, query.delete, (err, res) => {
				if (err) {
					return callback(err)
				} else if (res.code == "01") {
					return callback(res)
				} else {
					query.select = {
						where: {
							user_id: req.body.owner_id
						},
						attributes: ['device_key']
					}
			
					User.findOne(query.select)
						.then(resultUser => {
							let payload = {
								notif: {
									title: "Confirmation Share Device is Failed",
									body: `Your Device ${req.body.device_id} Confirmation is failed`,
									tag: req.body.device_id
								},
								data: {
									device_key: resultUser.device_key,
									user_id: req.auth.user_id,
									device_id: req.body.device_id
								}
							}
		
							if (resultUser.device_key === "") {
								APP.models.mongo.notif.create(
									{
										user_id: req.auth.user_id,
										notification: payload.notif,
										date: moment().format("YYYY-MM-DD"),
										time: moment().format("HH:mm:ss")
									}
								);
							} else {
								APP.request.sendNotif(APP.models, payload, (err, res) => {
									if (err) console.log("push notif error")
									else console.log("push notif berhasil")
								})
							}
						})
						.catch(err => {
							return callback({
								code: "GENERAL_ERR",
								message: JSON.stringify(err)
							});
						})
					return callback(null, {
						code : 'OK',
						error : 'false',
						message : 'Konfirmasi gagal, harus share ulang'
					})
				}
			})
		} else if (err.code == "ERR_DATABASE") {
			return callback(err)
		}
	})
};