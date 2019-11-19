const async = require('async');
const sequelize = require('sequelize');
const scheduler = require('node-schedule');

const db = require('../config/db.js'),
      datetime = require('../functions/datetime.js'),
      model = require('../config/model.js'),
      output = require('../functions/output.js'),
      request = require('../functions/request.js');

var APP = {},
    payloadLog = {},
    query = {};

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
                let timeDiff = datetime.timeDiff(rows.time, time, 'minutes')

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
            payloadLog.info = 'DEVICE CRON ERROR : DISCONNECTED DEVICE';
            payloadLog.message = e;
            payloadLog.level = { error : true }

            output.log(payloadLog)
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
            payloadLog.info = 'DEVICE CRON ERROR : INIT APP';
            payloadLog.message = err;
            payloadLog.level = { error : true }

            return output.log(payloadLog)
        }
	})

    // Scheduler Device On Off
	scheduler.scheduleJob('*/15 * * * *', function(time) {
        let DevicePIN = APP.models.mysql.device_pin
        let hours = (time.getHours() < 10 ? '0' : '' ) + time.getHours()
		let minutes = (time.getMinutes() < 10 ? '0' : '' ) + time.getMinutes()
		let seconds = (time.getSeconds() < 10 ? '0' : '') + time.getSeconds()
        let convertedTime = [hours, minutes, seconds].join(':')
        
        payloadLog.info = `SCHEDULER DEVICE ON/OFF`
        payloadLog.level = { error : false }

        query.attributes = [
            'device_id',
            'user_id',
            'device_ip',
            'device_name',
            'pin',
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

        DevicePIN.findAll(query).then((result) => {
            if (result.length > 0) {
                for (let index = 0; index < result.length; index++) {
                    let device = result[index].toJSON()
                    let url = `${process.env.APP_URL}/device/command`
                    let params = {
                        "user_id" : device.user_id.toString(),
                        "device_id" : device.device_id.toString(),
                        "device_ip" : device.device_ip.toString(),
                        "device_name" : device.device_name ? device.device_name.toString() : null,
                        "mode" : "1",
                        "pin" : device.pin.toString()
                    }

                    if (device.timer_on == convertedTime) {
                        payloadLog.message = `TIMER ON at ${convertedTime}` + '\n' +
                                             `DEVICE ID : ${device.device_id}` + '\n' +
                                             `DEVICE IP : ${device.device_ip}`

                        params.switch = "1"
                    }
                    if (device.timer_off == convertedTime) {
                        payloadLog.message = `TIMER OFF at ${convertedTime}` + '\n' +
                                             `DEVICE ID : ${device.device_id}` + '\n' +
                                             `DEVICE IP : ${device.device_ip}`

                        params.switch = "0"
                    }

                    request.post(url, params, (err, result) => {
                        if (err) {
                            payloadLog.info = 'DEVICE CRON ERROR : REQUEST';
                            payloadLog.message = err;
                            payloadLog.level = { error : true }

                            return output.log(payloadLog)
                        } else {
                            payloadLog.level = { error : false }

                            return output.log(payloadLog)
                        }
                    })
                }				
            } else {
                payloadLog.message = `NO SCHEDULED DEVICE AT THIS TIME`
                payloadLog.level = { error : false }

                return output.log(payloadLog)
            }
        }).catch((err) => {
            payloadLog.info = 'DEVICE CRON ERROR : DB';
            payloadLog.message = err;
            payloadLog.level = { error : true }

            return output.log(payloadLog)
        });
    });
    
    // Scheduler Connected Device
    // scheduler.scheduleJob('*/5 * * * *', function (timeCron) {
    //     let Device = APP.models.mysql.device
    //     let timeFormat = datetime.formatHMS(timeCron)
    //     let dateFormat = datetime.formatYMD(timeCron)

    //     console.log(`=============== SCHEDULER CHECK DC DEVICE at ${dateFormat} ${timeFormat} ===============`)

    //     query.where = {
    //         'switch': '1',
    //         'is_connected': '1'
    //     }
    //     query.attributes = [ 'device_id' ]

    //     async.waterfall([
    //         function getID(callback) {
    //             Device.findAll(query).then((result) => {
    //                 let deviceID = []
                    
    //                 for (let i = 0; i < result.length; i++) {
    //                     let res = result[i].toJSON()

    //                     deviceID[i] = res.device_id
    //                 }
                    
    //                 callback(null, deviceID)
    //             })
    //             .catch((err) => {
    //                 callback({
    //                     code: 'ERR_DATABASE',
    //                     data: JSON.stringify(err)
    //                 })
    //             })
    //         },

    //         function getDataUpdate(data, callback) {
    //             dcDevice(data, APP, timeFormat).then(device => {
    //                 callback(null, device)
    //             }).catch(err => {
    //                 callback(err)
    //             });
    //         },

    //         function updateData(data, callback) {
    //             query.value = {
    //                 is_connected : 0
    //             }
    //             query.options = {
    //                 where : {
    //                     device_id : data
    //                 }
    //             }
                
    //             Device.update(query.value, query.options).then((result) => {
    //                 callback(null, {
    //                     code : 'OK',
    //                     message : `${result} Device Disconnected`,
    //                     device_id : data
    //                 })
    //             }).catch((err) => {
    //                 callback(err)
    //             });
    //         }
    //     ], function (err, result) {
    //         if (err) {
    //             console.log(err)
    //         } else {
    //             console.log(result)
    //         }
    //     })
    // })

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