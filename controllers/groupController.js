"use strict";

const async = require('async');
const md5 = require('md5');
const unirest = require('unirest');
const request = require('../functions/request.js');

var query = {};

exports.creategroup = function (APP, req, callback) {
	
	var datareq = req.body
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.name) return callback({ code: 'MISSING_KEY' })
	if(!datareq.description) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log("create group");
	APP.models.mysql.device_group.create({
		id_akun: datareq.id_akun,
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

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_group) return callback({ code: 'MISSING_KEY' })
	if(!datareq.tdl) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	console.log("updatetdl");
	APP.db.sequelize.query("update device_group set tdl = '" + datareq.tdl + "' where id_akun = '" + datareq.id_akun + "' and id = '" + datareq.id_group + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
	.then(device => {

		response = {
			code : 'OK',	
			message : 'Update tdl success'
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

exports.updategroupname = function (APP, req, callback) {

	var datareq = req.body
	console.log(datareq);
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_group) return callback({ code: 'MISSING_KEY' })
	if(!datareq.name) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	console.log("updategroupname");
	APP.db.sequelize.query("update device_group set name = '" + datareq.name + "', description = '" + datareq.description + "' where id_akun = '" + datareq.id_akun + "' and id = '" + datareq.id_group + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
	.then(device => {

		response = {
			code : 'OK',	
			message : 'Update name success'
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

exports.getdevicegroup = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device_box_listrik
	
	if(!params.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!params.id_group) return callback({ code: 'MISSING_KEY' })
	
	query.where = { 
		id_akun : params.id_akun,
		group_id : params.id_group,
	}
	query.attributes = { exclude: ['created_at', 'updated_at'] }
	
	// APP.db.sequelize.query("select id_device, ip_device, nama_device, status_device, saklar, tipe_device, jml_pin from device_box_listrik where id_akun = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.SELECT})	
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

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_group) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	console.log("updatetdl");
	APP.db.sequelize.query("update device_box_listrik set group_id = '" + datareq.id_group + "' where id_akun = '" + datareq.id_akun + "' and id_device = '" + datareq.id_device + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
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
	
};

exports.removegroup = function (APP, req, callback) {

	var datareq = req.body
	console.log(datareq);
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_group) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_device) return callback({ code: 'MISSING_KEY' })

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	console.log("updatetdl");
	APP.db.sequelize.query("update device_box_listrik set group_id = NULL where id_akun = '" + datareq.id_akun + "' and id_device = '" + datareq.id_device + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	
	.then(device => {

		response = {
			code : 'OK',	
			message : 'Group removed'
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

exports.getgroup = function (APP, req, callback) {
	const params = req.body
	const Device = APP.models.mysql.device_group
	
	if(!params.id_akun) return callback({ code: 'MISSING_KEY' })
	
	query.where = { 
		id_akun : params.id_akun
	}
	query.attributes = { exclude: ['created_at', 'updated_at'] }
	
	// APP.db.sequelize.query("select id_device, ip_device, nama_device, status_device, saklar, tipe_device, jml_pin from device_box_listrik where id_akun = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.SELECT})	
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
	
	var params = APP.queries.select('device_box_listrik', req, APP.models);
	var datareq = req.body
	var response = {}

	if(!datareq.id_akun) return callback({ code: 'MISSING_KEY' })
	if(!datareq.id_group) return callback({ code: 'MISSING_KEY' })

	console.log(datareq)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	APP.db.sequelize.query("delete from device_group where id = '" + datareq.id_group + "' and id_akun = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})

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
	APP.db.sequelize.query('CALL sitadev_iot.sp_runtimereport_total_pergroup (:id_akun, :group_id, :start_date, :end_date)',
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
	APP.db.sequelize.query('CALL sitadev_iot.sp_runtimereport_pergroup (:id_akun, :group_id, :start_date, :end_date)',
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
	APP.db.sequelize.query('CALL sitadev_iot.sp_runtimereport_group_perday (:id_akun, :group_id, :start_date, :end_date)',
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