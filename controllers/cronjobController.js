const async = require("async"),
    moment = require("moment"),
    sequelize = require("sequelize"),
    scheduler = require("node-schedule");

const db = require("../config/db.js"),
    datetime = require("../functions/datetime.js"),
    model = require("../config/model.js"),
    output = require("../functions/output.js"),
    request = require("../functions/request.js"),
    deviceController = require("../controllers/deviceController.js"),
    devicePIN = APP => APP.models.mysql.device_pin;

var APP = {};

async function dcDevice(ids, app, time) {
    let Log = app.models.mongo.log;
    let updateId = [];

    for (let id of ids) {
        query = {
            endpoint: "/device/sensordata",
            status: "200",
            "request.id_device": id
        };

        try {
            let rows = await Log.findOne(query)
                .sort({ date: "desc", time: "desc" })
                .exec();

            if (rows) {
                let isToday = datetime.isToday(rows.date);
                let timeDiff = datetime.timeDiff(rows.time, time, "minutes");

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
        } catch (e) {
            payloadLog.info = "DEVICE CRON ERROR : DISCONNECTED DEVICE";
            payloadLog.message = e;
            payloadLog.level = { error: true };

            output.log(payloadLog);
        }
    }

    return updateId;
}

module.exports = function () {
    /**
     * Init Base APP Cron
     */
    async.waterfall(
        [
            function initializeModels(callback) {
                model(db, (err, result) => {
                    if (err) {
                        callback(err);
                    } else {
                        APP.models = result;
                        APP.db = db;

                        callback(null, true);
                    }
                });
            }
        ],
        (err, result) => {
            if (err) {
                payloadLog.info = "DEVICE CRON ERROR : INIT APP";
                payloadLog.message = err;
                payloadLog.level = { error: true };

                return output.log(payloadLog);
            }
        }
    );

    /**
     * Scheduler Device Timer (1 seconds)
     */
    scheduler.scheduleJob("* * * * *", function(time) {
        let timeNow = `${moment(time).format("HH:mm")}:00`,
            options = {
                where: {
                    [sequelize.Op.or]: [{ timer_on: timeNow }, { timer_off: timeNow }]
                }
            };

        devicePIN(APP)
            .findAll(options)
            .then(resultPin => {
                if (resultPin.length > 0) {
                    resultPin.map(device => {
                        // Init Body
                        let log = { info: "DEVICE TIMER CRON" },
                            body = {
                                user_id: device.user_id.toString(),
                                device_id: device.device_id.toString(),
                                device_name: device.device_name
                                    ? device.device_name.toString()
                                    : null,
                                mode: "1",
                                pin: device.pin.toString()
                            };

                        // Timer ON
                        if (timeNow == device.timer_on) body.switch = "1";
                        // Timer OFF
                        if (timeNow == device.timer_off) body.switch = "0";

                        deviceController.command(APP, { body }, (err, result) => {
                            if (err) {
                                log.info += " ERROR : COMMAND";
                                log.message = err;
                                log.level = { error: true };

                                return output.log(log);
                            }

                            log.info += ` AT ${timeNow}`;
                            log.message = `DEVICE ID : ${device.device_id}` + "\n";
                            log.message += `DEVICE NAME : ${device.device_name}` + "\n";
                            log.message += `PIN : ${device.pin}`;
                            log.level = { error: false };

                            return output.log(log);
                        });
                    });
                }
            });
    });

    /**
     * Scheduler Device Timer (1 seconds)
     */
    // scheduler.scheduleJob("*/15 * * * *", function(time) {
    //     let DevicePIN = APP.models.mysql.device_pin;
    //     (timeNow = moment(time).format("HH:mm:ss")),
    //         (timeSubtract = moment(time)
    //             .subtract(15, "minutes")
    //             .format("HH:mm:ss")),
    //         (payloadLog = {}),
    //         (query = {});

    //     payloadLog.info = `SCHEDULER DEVICE ON/OFF`;
    //     payloadLog.level = { error: false };

    //     query.attributes = [
    //         "device_id",
    //         "user_id",
    //         "device_ip",
    //         "device_name",
    //         "pin",
    //         "timer_on",
    //         "timer_off"
    //     ];
    //     query.where = {
    //         [sequelize.Op.or]: [
    //             {
    //                 timer_on: {
    //                     [sequelize.Op.between]: [timeSubtract, timeNow]
    //                 }
    //             },
    //             {
    //                 timer_off: {
    //                     [sequelize.Op.between]: [timeSubtract, timeNow]
    //                 }
    //             }
    //         ],
    //         timer_status: "1"
    //     };

    //     DevicePIN.findAll(query)
    //         .then(result => {
    //             if (result.length > 0) {
    //                 for (let index = 0; index < result.length; index++) {
    //                     let device = result[index].toJSON();
    //                     let body = {
    //                         user_id: device.user_id.toString(),
    //                         device_id: device.device_id.toString(),
    //                         device_name: device.device_name
    //                             ? device.device_name.toString()
    //                             : null,
    //                         mode: "1",
    //                         pin: device.pin.toString()
    //                     };

    //                     if (
    //                         timeNow >= device.timer_on &&
    //                         device.timer_on >= timeSubtract
    //                     ) {
    //                         payloadLog.message =
    //                             `TIMER ON at ${device.timer_on}` +
    //                             "\n" +
    //                             `DEVICE ID : ${device.device_id}` +
    //                             "\n" +
    //                             `DEVICE IP : ${device.device_ip}`;

    //                         body.switch = "1";
    //                     }
    //                     if (
    //                         timeNow >= device.timer_off &&
    //                         device.timer_off >= timeSubtract
    //                     ) {
    //                         payloadLog.message =
    //                             `TIMER OFF at ${device.timer_off}` +
    //                             "\n" +
    //                             `DEVICE ID : ${device.device_id}` +
    //                             "\n" +
    //                             `DEVICE IP : ${device.device_ip}`;

    //                         body.switch = "0";
    //                     }

    //                     deviceController.command(
    //                         APP,
    //                         { body },
    //                         (err, result) => {
    //                             if (err) {
    //                                 payloadLog.info =
    //                                     "DEVICE CRON ERROR : COMMAND";
    //                                 payloadLog.message = err;
    //                                 payloadLog.level = { error: true };

    //                                 return output.log(payloadLog);
    //                             }

    //                             payloadLog.level = { error: false };

    //                             return output.log(payloadLog);
    //                         }
    //                     );
    //                 }
    //             } else {
    //                 payloadLog.message = `NO SCHEDULED DEVICE AT THIS TIME`;
    //                 payloadLog.level = { error: false };

    //                 return output.log(payloadLog);
    //             }
    //         })
    //         .catch(err => {
    //             payloadLog.info = "DEVICE CRON ERROR : DB";
    //             payloadLog.message = err;
    //             payloadLog.level = { error: true };

    //             return output.log(payloadLog);
    //         });
    // });

    // Scheduler Alert Token
    scheduler.scheduleJob("0 * * * *", function (time) {
        let payloadLog = {},
            query = {};

        payloadLog.info = `SCHEDULER TOKEN CHECKER`;
        payloadLog.level = { error: false };

        query.where = { notif_token_alert: 1 };
        query.include = "electricity_pricing";
        query.attributes = ["user_id", "device_key", "token"];

        APP.models.mysql.user
            .findAll(query)
            .then(result => {
                if (result) {
                    result.map(user => {
                        /**
                         * CONDITION
                         * if notif token alert is turned on
                         * if user token less than 20kwh
                         */
                        if (user.notif_token_alert == 1 && user.token <= 20) {
                            let pricing = user.electricity_pricing,
                                token_kwh = parseFloat(user.token).toFixed(2),
                                token_rph = parseInt(token_kwh * parseInt(pricing.rp_lbwp)),
                                payloadNotif = {
                                    notif: {
                                        title: "Critical Token Balance",
                                        body: `Your token balance Rp.${token_rph}, or ${token_kwh} kWh and it's about to die`
                                    },
                                    data: {
                                        user_id: user.user_id,
                                        device_key: user.device_key
                                    }
                                };

                            request.sendNotif(APP.models, payloadNotif, (err, res) => {
                                if (err) throw new Error(err);

                                payloadLog.message =
                                    `Critical Token Balance on User ${user.user_id}` +
                                    "\n" +
                                    `Token Balance (kWh) : ${token_kwh}` +
                                    "\n" +
                                    `Token Balance (rph) : ${token_rph}`;
                                payloadLog.level = { error: false };

                                return output.log(payloadLog);
                            });
                        } else {
                            throw new Error("NOT_FOUND");
                        }
                    });
                } else {
                    throw new Error("NOT_FOUND");
                }
            })
            .catch(err => {
                switch (err.message) {
                    case "NOT_FOUND":
                        payloadLog.message = `NO SCHEDULED TOKEN ALERT AT THIS TIME`;
                        payloadLog.level = { error: false };

                        break;

                    default:
                        payloadLog.info = "TOKEN CRON ERROR";
                        payloadLog.message = err.message;
                        payloadLog.level = { error: true };

                        break;
                }

                return output.log(payloadLog);
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
};
