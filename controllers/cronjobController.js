const sequelize = require('sequelize');
const scheduler = require('node-schedule');

const db = require('../config/db.js');
const model = require('../config/model.js');
const request = require('../functions/request.js');

var query = {};

module.exports = function () {
    // Scheduler Device On Off
	scheduler.scheduleJob('*/30 * * * *', function(time) {
        var hours = (time.getHours() < 10 ? '0' : '' ) + time.getHours()
		var minutes = (time.getMinutes() < 10 ? '0' : '' ) + time.getMinutes()
		var seconds = (time.getSeconds() < 10 ? '0' : '') + time.getSeconds()
		var convertedTime = [hours, minutes, seconds].join(':')
        
		console.log(`=============== SCHEDULER DEVICE ON/OFF at ${convertedTime} ===============`)

		model(db, (err, resModel) => {
            if (err) {
                console.log("==========!!!!! TIMER CRON ERROR : MODEL !!!!!==========")
                console.log(err)
            }
            
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
    
            resModel.mysql.device_box_listrik.findAll(query).then((result) => {
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
	});
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