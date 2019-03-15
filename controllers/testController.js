"use strict";

const async = require('async');
const md5 = require('md5');
var output = {};

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
	
	var params = APP.queries.select('device_box_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.id_device)
	console.log(datareq.id_akun)
	console.log(datareq.ip_device)
	console.log(datareq.nama_device)
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	console.log("insert device");
	APP.models.mysql.device_box_listrik.create({
        id_device: datareq.id_device,
		id_akun: datareq.id_akun,
		ip_device: datareq.ip_device,		
        status_device: '0',
		nama_device: datareq.nama_device,
		tanggal_install: date,
		saklar: '0',
		created_at: date,
		update_at: date
    }).then((rows) => {
		console.log(rows)
		return callback(null, {
			code : '00',
			error : 'false',
			message : 'Data saved'
		});
	}).catch((err) => {
		console.log(err)
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
	
};

exports.getdevice = function (APP, req, callback) {
	
	var params = APP.queries.select('device_box_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.id_akun)	
	
	APP.db.sequelize.query("select id_device, ip_device, nama_device, status_device, saklar from device_box_listrik where id_akun = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.SELECT})
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

exports.activatedevice = function (APP, req, callback) {
	
	var params = APP.queries.select('device_box_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.id_device)
	console.log(datareq.id_akun)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	console.log("activate device");
	APP.db.sequelize.query("update device_box_listrik set status_device = 1, tanggal_aktif = now() where id_device = '" + datareq.id_device + "' and id_akun = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	.then(device => {
		console.log("xxx")
		return callback(null, {
			code : '00',
			error : 'false',
			message : 'Activate success'
		});
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
	
};

exports.registerkeyword = function (APP, req, callback) {
	
	var params = APP.queries.select('device_detail_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.id_device)
	console.log(datareq.keyword)
	console.log(datareq.id_pin)
	
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
	
	var params = APP.queries.select('device_box_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.id_device)
	console.log(datareq.id_akun)
	
	APP.db.sequelize.query("select id_device, ip_device, nama_device, status_device, tanggal_install, tanggal_aktif, saklar from device_box_listrik where id_akun = '" + datareq.id_akun + "' and id_device = '" + datareq.id_device + "'", { type: APP.db.sequelize.QueryTypes.SELECT})
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

exports.updatename = function (APP, req, callback) {
	
	var params = APP.queries.select('device_box_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.id_device)
	console.log(datareq.id_akun)
	console.log(datareq.nama_device)
	
	APP.db.sequelize.query("update device_box_listrik set nama_device = '" + datareq.nama_device + "' where id_device = '" + datareq.id_device + "' and id_akun = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	.then(device => {		
		return callback(null, {
			code : '00',
			error : 'false',
			message : 'Update success',
			id_device: datareq.id_device,
			id_akun: datareq.id_akun,
			nama_device: datareq.nama_device
		});
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
	
};

exports.deletedevice = function (APP, req, callback) {
	
	var params = APP.queries.select('device_box_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.id_device)
	console.log(datareq.id_akun)
	
	APP.db.sequelize.query("delete from device_box_listrik where id_device = '" + datareq.id_device + "' and id_akun = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	.then(device => {
		console.log("xxx")
		return callback(null, {
			code : '00',
			error : 'false',
			message : 'Delete success'
		});
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
	
};

exports.devicehistory = function (APP, req, callback) {
	
	var params = APP.queries.select('device_history_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.id_akun)
	console.log(datareq.id_device)
	console.log(datareq.date_from)
	console.log(datareq.date_to)

	var query = "select id_device, ip_device, IFNULL(id_pin,'-') as pin, nama_device, saklar, tanggal from device_history_listrik where id_akun = '" + datareq.id_akun + "' and tanggal > '" + datareq.date_from + "' and tanggal < '" + datareq.date_to + "'"

	if (datareq.id_device != '')
	{
		query = query + " and id_device = '" + datareq.id_device + "'"
	}
	
	APP.db.sequelize.query(query, { type: APP.db.sequelize.QueryTypes.SELECT})
	//APP.db.sequelize.query("select now()", { type: APP.db.sequelize.QueryTypes.SELECT})
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

exports.command = function (APP, req, callback) {
	
	var params = APP.queries.select('device_detail_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.id_device)
	console.log(datareq.id_akun)
	console.log(datareq.ip_device)
	console.log(datareq.status)
	console.log(datareq.nama_device)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	APP.db.sequelize.query("update device_box_listrik set saklar = '" + datareq.status + "' where id_device = '" + datareq.id_device + "' and id_akun = '" + datareq.id_akun + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	.then(device => {
		console.log("add to history")
		APP.models.mysql.device_history_listrik.create({
			id_device: datareq.id_device,
			id_akun: datareq.id_akun,
			ip_device: datareq.ip_device,					
			saklar: datareq.status,
			nama_device: datareq.nama_device,
			tanggal: date,
			created_at: date,
			update_at: date
		}).then((rows) => {
			return callback(null, {
				code : '00',
				error : 'false',
				message : 'Command success and saved'
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

};

exports.sensordata = function (APP, req, callback) {
	
	var params = APP.queries.select('device_box_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.id_device)
	console.log(datareq.id_akun)
	console.log(datareq.ip_device)
	console.log(datareq.ampere)
	console.log(datareq.wattage)
	console.log(datareq.status)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	console.log('sp')
	APP.db.sequelize.query('CALL sitadev_iot.sp_datasensor (:id_device, :id_akun, :ip_device, :status_device, :current_sensor, :watt, :is_proceed)',
		{ 
			replacements: {
				id_device: datareq.id_device,
				id_akun: datareq.id_akun,
				ip_device: datareq.ip_device,		
				status_device: datareq.status,
				current_sensor: datareq.ampere,
				watt: datareq.wattage,
				is_proceed:'0'
			}, 
			type: APP.db.sequelize.QueryTypes.RAW 
		}
	)

	.then((rows) => {
		console.log(rows[0].message)
		var spreturn = rows[0].message

		if (spreturn == '0')
		{
			return callback(null, {
				code : '01',
				error : 'true',
				message : 'Device status not activated yet'
			});
		}
		else
		{
			return callback(null, {
				code : '00',
				error : 'false',
				message : 'Data saved'
			});
		}		
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
	
};

exports.runtimedashboard = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq.id_device)
	console.log(datareq.id_akun)
	console.log(datareq.ip_device)

	var query = "select id_device,ip_device,is_active, max(SEC_TO_TIME(uptime)) as Runtime, max(kwh/1000) as KwH, max((kwh/1000)*2000) as Rp from device_report where id_akun = '" + datareq.id_akun + "'"

	if (datareq.id_device != '')
	{
		query = query + " and id_device = '" + datareq.id_device + "'"
	}

	if (datareq.ip_device != '')
	{
		query = query + " and ip_device = '" + datareq.ip_device + "'"
	}
	
	query = query + " group by id_device"

	APP.db.sequelize.query(query, { type: APP.db.sequelize.QueryTypes.SELECT})
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

exports.runtimereport = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq.id_akun)
	console.log(datareq.date_from)
	console.log(datareq.date_to)

	console.log('spdevice')
	APP.db.sequelize.query('CALL sitadev_iot.sp_runtimereport_perdevice (:id_akun, :date_from, :date_to)',
		{ 
			replacements: {
				id_akun: datareq.id_akun,
				date_from: datareq.date_from,		
				date_to: datareq.date_to
			}, 
			type: APP.db.sequelize.QueryTypes.RAW 
		}
	)

	.then(perdevice => {
		var perdevice = perdevice

		console.log('sptotal')
		APP.db.sequelize.query('CALL sitadev_iot.sp_runtimereport_total (:id_akun, :date_from, :date_to)',
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
				code : '00',
				error : 'false',
				message : 'Data Found',
				datatotal : device,
				dataperdevice : perdevice
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

	/* .then((rows) => {
		console.log(rows[0].message)
		var spreturn = rows[0].message

		if (spreturn == '0')
		{
			return callback(null, {
				code : '01',
				error : 'true',
				message : 'Device status not activated yet'
			});
		}
		else
		{
			return callback(null, {
				code : '00',
				error : 'false',
				message : 'Data saved'
			});
		}		
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});

	var query = "select id_device, id_akun, ip_device, is_proceed, max(SEC_TO_TIME(up_time)) as Runtime, max(kwh/1000) as KwH, max((kwh/1000)*2000) as Rp from device_box_sensor where up_time is not NULL and is_proceed = 1 and id_akun = '" + datareq.id_akun + "' and date_on > '" + datareq.date_from + "' and date_on < '" + datareq.date_to + "' group by id_device"

	APP.db.sequelize.query(query, { type: APP.db.sequelize.QueryTypes.SELECT})
	.then(device => {
		console.log(device)
		return callback(null, {
			code : '00',
			error : 'false',
			message : 'Data Found',
			data : 
				{
					devicerport : device,
					TotalKwH : '1000',
					TotalRp : '2000'
				}
		});
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	}); */
	
};

exports.runtimedetail = function (APP, req, callback) {
	
	var datareq = req.body
	console.log(datareq.id_device)
	console.log(datareq.id_akun)
	console.log(datareq.date_from)
	console.log(datareq.date_to)
	console.log(datareq.ip_device)

	console.log('sptotal')
		APP.db.sequelize.query('CALL sitadev_iot.sp_runtimereport_perday (:id_akun, :id_device, :ip_device, :date_from, :date_to)',
			{ 
				replacements: {
					id_akun: datareq.id_akun,
					id_device: datareq.id_device,
					ip_device: datareq.ip_device,
					date_from: datareq.date_from,		
					date_to: datareq.date_to
				}, 
			type: APP.db.sequelize.QueryTypes.RAW 
			}
		)

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

exports.testing = function (APP, req, callback) {
	
	var params = APP.queries.select('device_box_listrik', req, APP.models);
	var datareq = req.body
	console.log(datareq.id_device)

	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);

	/* console.log('sp')
	APP.db.sequelize.query('CALL sitadev_iot.sp_datasensor (:id_device, :id_akun, :ip_device, :status_device, :current_sensor, :watt, :is_proceed)',
		{ 
			replacements: {
				id_device: datareq.id_device,
				id_akun: datareq.id_akun,
				ip_device: datareq.ip_device,		
				status_device: datareq.status,
				current_sensor: datareq.ampere,
				watt: datareq.wattage,
				is_proceed:'0'
			}, 
			type: APP.db.sequelize.QueryTypes.RAW 
		}
	)

	.then((rows) => {
		console.log(rows[0].message)
		var spreturn = rows[0].message

		if (spreturn == '0')
		{
			return callback(null, {
				code : '01',
				error : 'true',
				message : 'Device status not activated yet'
			});
		}
		else
		{
			return callback(null, {
				code : '00',
				error : 'false',
				message : 'Data saved'
			});
		}		
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	}); */
	
};
/* exports.testingtoken = function (APP, req, callback) {
	
	var unirest = require('unirest');
	var datareq = req.body
	var lantai = datareq.lantai
	
	unirest.post('http://localhost:5000/status')
		.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
		.send({"lantai": lantai})
		.end(function (response) {
			console.log(response.body);
			return callback(null, {
				code : '00',
				error : 'false',
				message : 'Data Found',
				data : response.body
				});
			});
	
};

exports.command = function (APP, req, callback) {
	
	var unirest = require('unirest');
	var params = APP.queries.select('device_detail_listrik', req, APP.models);
	var datareq = req.body
	var type = datareq.type
	var id = datareq.id
	var status = datareq.status
	var lantai = datareq.lantai
	
	var date = new Date();
	date.setHours(date.getHours());
	console.log(date);
	
	unirest.post('http://localhost:5000/command')
		.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
		.send({"lantai": lantai,"type": type,"id": id,"status":status})
		.end(function (response) {
			console.log(response.body);
			var datacomm = response.body
			
			if (datacomm.code == '00')
			{
				APP.models.mysql.device_history_listrik.create({
					id_device: datareq.id_device,
					id_akun: datareq.id_akun,
					ip_device: datareq.ip_device,
					id_pin: datareq.id,					
					saklar: datareq.status,
					nama_device: datareq.nama_device,
					tanggal: date
				}).then((rows) => {
					return callback(null, {
						code : '00',
						error : 'false',
						message : 'Command success and saved'
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
				var respond_data = {
							code : '01',
							error : 'true',
							message : 'Command error and saved'
							};
				res.send(respond_data)
			}
			});
	
};

exports.status = function (APP, req, callback) {
	
	var unirest = require('unirest');
	var datareq = req.body
	var lantai = datareq.lantai
	
	unirest.post('http://localhost:5000/status')
		.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
		.send({"lantai": lantai})
		.end(function (response) {
			console.log(response.body);
			return callback(null, {
				code : '00',
				error : 'false',
				message : 'Data Found',
				data : response.body
				});
			});
	
}; */





















