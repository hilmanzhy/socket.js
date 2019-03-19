const async = require('async');
const sequelize = require('sequelize');
const scheduler = require('node-schedule');

const db = require('../config/db.js');
const model = require('../config/model.js');
const request = require('../functions/request.js');
const datetime = require('../functions/datetime.js');

var query = {};
var APP = {};

async function dcDevice(ids, app, time) {
    let Log = app.models.mongo.log;
    let updateId = [];

    for (let id of ids) {
        query = {
            'endpoint': '/device/sensordata',
            'status': '200',
            'request.id_device': id
        }

        try {
            let rows = await Log.findOne(query).sort({ date: 'desc', time: 'desc' }).exec();
            
            if (rows) {
                let isToday = datetime.isToday(rows.date)
                let timeDiff = datetime.timeDiff(rows.time, time)

                if (isToday) {
                    if (timeDiff >= 5) {
                        updateId.push(id);
                    }
                } else {
                    updateId.push(id);
                }
            } else {
                updateId.push(id);
            }
        } catch(e) {
            console.log(e);
        }
    }

    return updateId
}

module.exports = function () {
    async.waterfall([
        function initializeModels (callback) {
			model(db, (err, result) => {
				if (err) {
                    callback(err);
                } else {
                    APP.models = result;
    
                    callback(null, true);
                }
			});
		}
    ], (err, result) => {
		if (err) {
            console.log("==========!!!!! TIMER CRON ERROR : INIT MODEL !!!!!==========")
            console.log(err)
        }
	})

    // Scheduler Device On Off
	scheduler.scheduleJob('*/30 * * * *', function(time) {
        let Device = APP.models.mysql.device_box_listrik
        let hours = (time.getHours() < 10 ? '0' : '' ) + time.getHours()
		let minutes = (time.getMinutes() < 10 ? '0' : '' ) + time.getMinutes()
		let seconds = (time.getSeconds() < 10 ? '0' : '') + time.getSeconds()
        let convertedTime = [hours, minutes, seconds].join(':')
        
		console.log(`=============== SCHEDULER DEVICE ON/OFF at ${convertedTime} ===============`)

        query.attributes = [
            'id_device',
            'id_akun',
            'ip_device',
            'nama_device',
            'tipe_device',
            'timer_on',
            'timer_off'
        ]
        query.where = {
            [sequelize.Op.or]: [
                { timer_on: convertedTime },
                { timer_off: convertedTime }
            ],
            timer_status: '1'
        }

        Device.findAll(query).then((result) => {
            if (result.length > 0) {
                for (let index = 0; index < result.length; index++) {
                    let device = result[index].toJSON()
                    let url = `http://localhost:${process.env.PORT}/device/command`
                    let params = {
                        "id_akun" : device.id_akun.toString(),
                        "id_device" : device.id_device.toString(),
                        "ip_device" : device.ip_device.toString(),
                        "nama_device" : device.nama_device.toString(),
                        "type" : device.tipe_device.toString(),
                        "mode" : "1",
                        "pin" : ""
                    }

                    if (device.timer_on == convertedTime) {
                        console.log("=============== TIMER  ON ===============")

                        params.status = "1"
                    }
                    if (device.timer_off == convertedTime) {
                        console.log("=============== TIMER OFF ===============")

                        params.status = "0"
                    }

                    request.post(url, params, (err, result) => {
                        if (err) {
                            console.log("==========!!!!! TIMER CRON ERROR : REQUEST !!!!!==========")
                            console.log(err)
                        } else {
                            console.log(result)
                        }
                    })
                }				
            }
        }).catch((err) => {
            console.log("==========!!!!! DEVICE CRON ERROR : DB !!!!!==========")
            console.log(err)
        });
    });
    
    // Scheduler Connected Device
    scheduler.scheduleJob('*/5 * * * *', function (timeCron) {
        let Device = APP.models.mysql.device_box_listrik
        let timeFormat = datetime.formatHMS(timeCron)
        let dateFormat = datetime.formatYMD(timeCron)

        console.log(`=============== SCHEDULER CHECK DC DEVICE at ${dateFormat} ${timeFormat} ===============`)

        query.where = {
            'saklar': '1',
            'is_connected': '1'
        }
        query.attributes = [ 'id_device' ]

        async.waterfall([
            function getID(callback) {
                Device.findAll(query).then((result) => {
                    let deviceID = []
                    
                    for (let i = 0; i < result.length; i++) {
                        let res = result[i].toJSON()

                        deviceID[i] = res.id_device
                    }
                    
                    callback(null, deviceID)
                })
                .catch((err) => {
                    callback({
                        code: 'ERR_DATABASE',
                        data: JSON.stringify(err)
                    })
                })
            },

            function getDataUpdate(data, callback) {
                dcDevice(data, APP, timeFormat).then(device => {
                    callback(null, device)
                }).catch(err => {
                    callback(err)
                });
            },

            function updateData(data, callback) {
                query.value = {
                    is_connected : 0
                }
                query.options = {
                    where : {
                        id_device : data
                    }
                }
                
                Device.update(query.value, query.options).then((result) => {
                    callback(null, {
                        code : 'OK',
                        message : `${result} Device Disconnected`,
                        device_id : data
                    })
                }).catch((err) => {
                    callback(err)
                });
            }
        ], function (err, result) {
            if (err) {
                console.log(err)
            } else {
                console.log(result)
            }
        })
    })

	// Scheduler Retensi Device
	/* scheduler.scheduleJob('0 * * * *', function(time) {
        // const { exec } = require('child_process');
        // const path = require('path')
        const Client = require('node-ssh')

        
        console.log(`=============== SCHEDULER RETENSI DEVICE ===============`)
        // console.log(path.resolve(__dirname+'/../storage/scripts/retensi_device_box_sensor.sh'))
        
        var ssh = new Client()
        ssh.connect({
            host: process.env.MYSQL_HOST,
            username: process.env.MYSQL_SSH_USER,
            password: process.env.MYSQL_SSH_PASS
        }).then(function() {
            console.log('=================== SSH MYSQL SERVER ===================')
            ssh.execCommand('/data/database/data_export/febrian/sitadev_iot/sh/sitadev_iot.sh').then(function(result) {
                console.log('STDOUT: ' + result.stdout)
                console.log('STDERR: ' + result.stderr)
            })
        })
          
        // exec(path.resolve(__dirname+'/../storage/scripts/retensi_device_box_sensor.sh'), (error, stdout, stderr) => {
        //     if (error) {
        //         console.error(`exec error: ${error}`);
        //         return;
        //     }
        //     console.log(`stdout: ${stdout}`);
        //     console.log(`stderr: ${stderr}`);
        // })
	}); */
}