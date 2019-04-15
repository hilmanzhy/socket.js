"use strict";

const async = require('async');
const md5 = require('md5');
const unirest = require('unirest');
const request = require('../functions/request.js');

var query = {};

exports.creategroup = function (APP, req, callback) {
	
	var datareq = req.body
	var response = {}

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.name) return callback({ code: 'MISSING_KEY' })
	if(!datareq.description) return callback({ code: 'MISSING_KEY' })
	if(!datareq.tdl) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log("create group");
	APP.models.mysql.device_group.create({

		user_id: datareq.user_id,
		name: datareq.name,		
		description: datareq.description,
		tdl: datareq.tdl

	}).then(device => {
		
		response = {
			code : 'OK',
			message : 'Create Group ' + datareq.name + ' Success'
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

exports.updategrouptdl = function (APP, req, callback) {

	var datareq = req.body
	console.log(datareq);
	var response = {}
	const Device = APP.models.mysql.device_group

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.group_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.tdl) return callback({ code: 'MISSING_KEY' })

	query.value = {
		tdl : datareq.tdl
	}
	query.options = {
		where : {
			id : datareq.group_id,
			user_id : datareq.user_id
		}
	}
	
	console.log("updatetdl");
	Device.findAll(query.options).then((result) => {
		if (result.length > 0) 
		{
			Device.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== update group tdl ==========`)
				console.log(resUpdate)
				
				return callback(null, {
					code : 'OK',
					message : 'Update group tdl success'
				});
			});
		} 
		else 
		{
			return callback(null, {
				code : 'NOT_FOUND',
				message : 'Group Not Found'
			});
		}
  	}).catch((err) => {
        return callback({
            code: 'ERR_DATABASE',
            data: JSON.stringify(err)
        });
    });
	
};

exports.updategroupname = function (APP, req, callback) {

	var datareq = req.body
	console.log(datareq);
	var response = {}
	const Device = APP.models.mysql.device_group

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.group_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.name) return callback({ code: 'MISSING_KEY' })
	if(!datareq.description) return callback({ code: 'MISSING_KEY' })

	query.value = {
		name : datareq.name,
		description : datareq.description
	}
	query.options = {
		where : {
			id : datareq.group_id,
			user_id : datareq.user_id
		}
	}

	console.log("updategroupname");
	Device.findAll(query.options).then((result) => {
		if (result.length > 0) 
		{
			Device.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== update group name and desc ==========`)
				console.log(resUpdate)
				
				return callback(null, {
					code : 'OK',
					message : 'Update group name and description success'
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
				message : 'Group Not Found'
			});
		}
  	}).catch((err) => {
        return callback({
            code: 'ERR_DATABASE',
            data: JSON.stringify(err)
        });
    });
	
};

exports.getdevicegroup = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device
	
	if(!params.user_id) return callback({ code: 'MISSING_KEY' })
	if(!params.group_id) return callback({ code: 'MISSING_KEY' })
	
	query.where = { 
		user_id : params.user_id,
		group_id : params.group_id,
	}
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

exports.assigngroup = function (APP, req, callback) {

	var datareq = req.body
	console.log(datareq);
	var response = {}
	const Device = APP.models.mysql.device
	const Device_group = APP.models.mysql.device_group

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.group_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })

	query.options = {
		where : {
			id : datareq.group_id
		}
	}

	console.log("assigngroup");
	Device_group.findAll(query.options).then((result) => {
		if (result.length > 0) 
		{
			query.options = {
				where : {
					device_id : datareq.device_id,
					user_id : datareq.user_id
				}
			}

			Device.findAll(query.options).then((result) => {
				if (result.length > 0) 
				{
					APP.db.sequelize.query("update device set group_id = '" + datareq.group_id + "' where user_id = '" + datareq.user_id + "' and device_id = '" + datareq.device_id + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
					.then(device => {

						response = {
							code : 'OK',	
							message : 'Assign group success'
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
			return callback(null, {
				code : 'NOT_FOUND',
				message : 'Group Not Found'
			});
		}
  	}).catch((err) => {
        return callback({
            code: 'ERR_DATABASE',
            data: JSON.stringify(err)
        });
	});
	
};

exports.removegroup = function (APP, req, callback) {

	var datareq = req.body
	console.log(datareq);
	var response = {}
	const Device = APP.models.mysql.device

	if(!datareq.user_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.group_id) return callback({ code: 'MISSING_KEY' })
	if(!datareq.device_id) return callback({ code: 'MISSING_KEY' })

	query.value = {
		group_id : null
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
			Device.update(query.value, query.options).then((resUpdate) => {
				console.log(`========== remove group ==========`)
				console.log(resUpdate)
				
				return callback(null, {
					code : 'OK',
					message : 'Device removed from group'
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
	
};

exports.getgroup = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device_group
	
	if(!params.id_akun) return callback({ code: 'MISSING_KEY' })
	
	query.where = { 
		user_id : params.id_akun
	}
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

exports.deletegroup = function (APP, req, callback) {
	
	var datareq = req.body
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_group) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	APP.db.sequelize.query("delete from device_group where id = '" + datareq.id_group + "' and user_id = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})

	.then(device => {
		console.log("delete device")

		response = {
			code : 'OK',
			message : 'Delete group success'
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

exports.grouptotalruntime = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}

    if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
    if(!datareq.id_group) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log('sp_runtimereport_total_pergroup')
	APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport_total_pergroup (:id_akun, :group_id, :start_date, :end_date)',
		{ 
			replacements: {
                id_akun: datareq.id_akun,
                group_id: datareq.id_group,
				start_date: datareq.date_from,		
				end_date: datareq.date_to
			}, 
			type: APP.db.sequelize.QueryTypes.RAW 
		}
	)

	.then(device => {
		
		console.log(device)
		response = {
			code : 'OK',
			message : 'Data Found',
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

exports.groupruntime = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}

    if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
    if(!datareq.id_group) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log('sp_runtimereport_pergroup')
	APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport_pergroup (:id_akun, :group_id, :start_date, :end_date)',
		{ 
			replacements: {
                id_akun: datareq.id_akun,
                group_id: datareq.id_group,
				start_date: datareq.date_from,		
				end_date: datareq.date_to
			}, 
			type: APP.db.sequelize.QueryTypes.RAW 
		}
	)

	.then(device => {
		
		console.log(device)
		response = {
			code : 'OK',
			message : 'Data Found',
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

exports.groupdailyruntime = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq);
	var response = {}

    if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
    if(!datareq.id_group) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_from) return callback({ code: 'MISSING_KEY' })
	if(!datareq.date_to) return callback({ code: 'MISSING_KEY' })
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log('sp_runtimereport_total_pergroup')
	APP.db.sequelize.query('CALL sitadev_iot_2.runtimereport_group_perday (:id_akun, :group_id, :start_date, :end_date)',
		{ 
			replacements: {
                id_akun: datareq.id_akun,
                group_id: datareq.id_group,
				start_date: datareq.date_from,		
				end_date: datareq.date_to
			}, 
			type: APP.db.sequelize.QueryTypes.RAW 
		}
	)

	.then(device => {
		
		console.log(device)
		response = {
			code : 'OK',
			message : 'Data Found',
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

exports.groupcommand = function (APP, req, callback) {
	const datareq = req.body
	const Device = APP.models.mysql.device_box_listrik
	var response = {}
	var datadevice = []
	
	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_group) return callback({ code: 'MISSING_KEY' })
	if(!datareq.status) return callback({ code: 'MISSING_KEY' })
	
	query.where = { 
		id_akun : datareq.id_akun,
		group_id : datareq.id_group,
	}
	query.attributes = { exclude: ['created_at', 'updated_at'] }
	
	Device.findAll(query).then((device) => {

		for (let i = 0; i < device.length; i++) {
			const element = device[i]
			console.log(element.id_device)

			var mode = ""
			if (element.tipe_device == '1')
			{
				mode = '1'
			}
			else
			{
				mode = '0'
			}

			var params = {
				"id_akun": datareq.id_akun,
				"id_device": element.id_device,
				"ip_device": element.ip_device,
				"nama_device": element.nama_device,
				"status": datareq.status,
				"type": element.tipe_device,
				"pin": "0",
				"mode": mode
			}
			console.log(params)
			var url = `http://localhost:${process.env.PORT}/device/command`

			console.log("hit device command")
			request.post(url, params, (err, result) => {
				if (err) {
					/* console.log("eror group command")
					datadevice.push({device :element.nama_device,"status":"failed"})

					if (i == device.length - 1)
					{
						var url = `http://localhost:${process.env.PORT}/group/reportgroupcommand`
						var params = {"data" : datadevice}
						console.log(params)
						console.log("hit reportgroupcommand")
						request.post(url, params, (err, result) => {
						})
					} */
				}
			})
		}

		response = {
			code : 'OK',
			message : 'Group command success'
		}
		return callback(null, response);
		
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});

};

exports.reportgroupcommand = function (APP, req, callback) {
	
	var datareq = req.data
	console.log(datareq);
	
};