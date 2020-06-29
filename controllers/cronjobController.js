const async = require("async"),
    moment = require("moment"),
    sequelize = require("sequelize"),
    scheduler = require("node-schedule");
const { unstable_renderSubtreeIntoContainer } = require("react-dom");

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
                                pin: device.pin.toString(),
                                share_device: "0",
                                user_id_shared: ""
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

                if (result.length > 0) {
                    result.map(( user , index ) => {                    
                        /**
                         * CONDITION
                         * if notif token alert is turned on
                         * if user token less than 20kwh
                         */
                        if (user.token <= 20) {

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
                            console.log('NOT_FOUND');
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

    // Scheduler report hsitory
    scheduler.scheduleJob('* 59 23 * * *', ( time ) => {
        let start_date = moment().startOf('month').format('YYYY-MM-DD');
        let end_date = moment().endOf('month').format('YYYY-MM-DD');
        let now = moment().format('YYYY-MM-DD');
        let { device_report, user, electricity_pricing, report_history } = APP.models.mysql;

        user.belongsTo( electricity_pricing, { foreignKey: 'tdl_id' } );

        if ( now == end_date ) {
            async.waterfall(
                [
                    function getDataDeviceReport( callback ) {
                        device_report
                            .findAll({
                                attributes: [
                                    'user_id',
                                    [sequelize.fn('sum', sequelize.col('kwh')), 'total_kwh'], 
                                ],
                                where: {
                                    date: { [sequelize.Op.between]: [ start_date, end_date ] }
                                },
                                group: ['user_id']
                            })
                            .then(res => {
                                if ( res.length == 0 ) return callback({
                                    code: 'NOT_FOUND',
                                    message: 'Data device report not found',
                                    payloadLog: {
                                        info: 'REPORT HSITORY END OF MONTH',
                                        message: 'Data device report not found',
                                        level: { error: false }
                                    }
                                });
    
                                callback( null, {
                                    data_report: res
                                });
                            })
                            .catch(err => {
                                callback({
                                    code: 'ERR',
                                    message: 'Error get device report',
                                    payloadLog: {
                                        info: 'REPORT HSITORY END OF MONTH',
                                        message: 'Error get device report',
                                        level: { error: true }
                                    },
                                    data: JSON.stringify( err )
                                });
                            });
                    },
                    function calcTotalRupiah( data, callback ) {
                        let { data_report } = data;
                        let data_insert = [];
    
                        Promise.all(
                            data_report.map( x => {
                                return user
                                    .findAll({
                                        attributes: ['email','user_id','device_key','name'],
                                        include: [
                                            {
                                                model: electricity_pricing,
                                                attributes: ['rp_lbwp'],
                                                required: true
                                            }
                                        ],
                                        where: { user_id: x.user_id }
                                    })
                                    .then(res => {
    
                                        let rp_lbwp = res[0].electricity_pricing.rp_lbwp || 0;
                                        let total_rp = rp_lbwp * data_report[0].dataValues.total_kwh;
    
                                        data_insert.push({
                                            user_id: x.user_id,
                                            total_kwh: ( data_report[0].dataValues.total_kwh ).toFixed(2),
                                            total_rp: Math.round ( total_rp * 100 ) / 100,
                                            year: moment().format('YYYY'),
                                            month: parseInt( moment().format('MM') ),
                                            rp_lbwp: rp_lbwp,
                                            email: res[0].email,
                                            device_key: res[0].device_key,
                                            name: res[0].name
                                        });
    
                                        return true;
                                    });
                            })
                        )
                        .then(res_promise => {
                            data.data_insert = data_insert;
    
                            callback( null, data );
                        })
                        .catch(err => {
                            callback({
                                code: 'ERR',
                                message: 'Error get eletrcity pricing',
                                payloadLog: {
                                    info: 'REPORT HSITORY END OF MONTH',
                                    message: 'Error get eletrcity pricing',
                                    level: { error: true }
                                },
                                data: JSON.stringify( err )
                            });
                        });
                    },
                    function insertReportHistory( data, callback ) {
                        report_history
                            .bulkCreate( data.data_insert )
                            .then(res => {
                                callback( null, data );
                            })
                            .catch(err => {    
                                callback({
                                    code: 'ERR',
                                    message: 'Error insert report history',
                                    payloadLog: {
                                        info: 'REPORT HSITORY END OF MONTH',
                                        message: 'Error insert report history',
                                        level: { error: true }
                                    },
                                    data: JSON.stringify( err )
                                });
                            });
                    },
                    function compareReport( data, callback ) {
                        let { data_insert } = data;
    
                        Promise.all(
                            data_insert.map( x => {
                                return report_history
                                    .findAll({
                                        attributes: ['total_kwh'],
                                        where: { user_id: x.user_id, month: ( x.month - 1 ) }
                                    })
                                    .then(res => {
    
                                        if ( res.length > 0 ) {
                                            let total_kwh = res[0].total_kwh || 0;
    
                                            x.old_total_kwh = total_kwh;
                                            x.exceeded_last_month = x.total_kwh > total_kwh ? true : false;    
                                        } else {
                                            x.old_total_kwh = 0;
                                            x.exceeded_last_month = false;    
                                        }
    
                                        return true;
                                    });
                            })
                        )
                        .then(res_promise => {
                            callback( null, data );
                        })
                        .catch(err => {
                            callback({
                                code: 'ERR',
                                message: 'Error compare report history',
                                payloadLog: {
                                    info: 'REPORT HSITORY END OF MONTH',
                                    message: 'Error compare report history',
                                    level: { error: true }
                                },
                                data: JSON.stringify( err )
                            });
                        });
                    },
                    function sendMailReport( data, callback ) {
                        let { data_insert } = data;
    
                        try {
                            data_insert.map( ( x, i ) => {
                                let payload = {
                                    to      : x.email,
                                    subject : `Report end of month`,
                                    html    : {
                                        file    : 'report_history.html',
                                        data    : {
                                            name    : x.name,
                                            cdn_url : `${ process.env.APP_URL }/cdn`,
                                            total_kwh: x.total_kwh,
                                            tota_rp: x.total_rp
                                        }
                                    }
                                }
    
                                request.sendEmail( payload, ( err, res ) => {
                    
                                    if ( err ) throw new Error( err );
    
                                    if ( i == data_insert.length - 1 ) {
                                        callback( null, data );
                                    }
                                })
                            });
                        } catch ( err ) {
                            callback({
                                code: 'ERR',
                                message: 'failed to send mail',
                                payloadLog: {
                                    info: 'REPORT HSITORY END OF MONTH',
                                    message: 'failed to send mail',
                                    level: { error: true }
                                },
                                data: JSON.stringify( err )
                            });
                        }
                    },
                    function sendNotif( data, callback ) {
                        let { data_insert } = data;
    
                        try {
                            data_insert.map( ( x, i ) => {
    
                                let payloadNotif = {
                                    notif: {
                                        title: "monthly usage notification",
                                        body:  x.total_kwh == 0 && x.exceeded_last_month == false ? `Usage last month did not exist` :
                                               x.total_kwh > 0 && x.exceeded_last_month == true ? `The usage of this month is more than last month` :
                                               x.total_kwh > 0 && x.exceeded_last_month == false ? `Congratulations on using this month more economically than last month` : ''
                                    },
                                    data: {
                                        user_id: x.user_id,
                                        device_key: x.device_key,
                                        total_kwh: x.total_kwh,
                                        old_total_kwh: x.old_total_kwh
                                    }
                                };
        
                                request.sendNotif( APP.models, payloadNotif, ( err, res ) => {
                                    if ( err ) throw new Error( err );
        
                                    if ( i == data_insert.length - 1 ) {
                                        callback( null, {
                                            code: 'OK',
                                            message: 'Success cronjob report hsitory end of month',
                                            payloadLog: {
                                                info: 'REPORT HSITORY END OF MONTH',
                                                message: 'Success cronjob report hsitory end of month',
                                                level: { error: false }
                                            }
                                        });
                                    }
                                });
                            });   
                        } catch ( err ) {
                            callback({
                                code: 'ERR',
                                message: 'failed to send notification',
                                payloadLog: {
                                    info: 'REPORT HSITORY END OF MONTH',
                                    message: 'failed to send notification',
                                    level: { error: true }
                                },
                                data: JSON.stringify( err )
                            });
                        }
                    }
                ],
                function ( err, result ) {
                    if ( err ) return output.log( err.payloadLog );
    
                    return output.log( result.payloadLog );
                }
            );   
        }
    });
    
    // scheduler check usage target jam 10.00
    scheduler.scheduleJob('0 00 10 * * *', () => {
        console.log('tes cron nrk');
        let {user} = APP.models.mysql;
        async.waterfall(
            [
                function getUser(callback) {
                    user.findAll({
                        attributes: ['user_id', 'name', 'device_key', 'verify_status', 'notif_usage_target', 'usage_target'],
                        where: {
                            verify_status: 1,
                            notif_usage_target: 1
                        }
                    })
                    .then(res => {
                        callback(null, res);
                    })
                    .catch(err => {
                        console.log(err);
                        callback({
                            code: 'ERR_DATABASE',
                            data: err
                        })
                    })
                },

                function checkUsageTarget(data, callback) {
                    Promise.all(
                        data.map((x, i) => {
                            let sp = 'call sitadev_iot_2.compare_target(:user_id)';

                            return APP.db.sequelize
                                .query(sp, {
                                    replacements: {
                                        user_id: x.user_id
                                    },
                                    type: APP.db.sequelize.QueryTypes.RAW
                                })
                                .then(result => {   
                                    let obj = {};
                                    obj.loop = i + 1,
                                    obj.user_id = x.user_id;
                                    obj.device_key = x.device_key;
                                    obj.notif_usage_target = x.notif_usage_target;
                                    obj.usage_target = x.usage_target;
                                    obj.data = result[0].message;   

                                    return obj;
                                })
                                .catch(err => {
                                    return callback({
                                        code: "ERR_DATABASE",
                                        data: err
                                    });
                                });
                        })
                    )
                    .then(arr => {
                        console.log(arr);
                        
                        // callback(null, arr);
                    })
                    .catch(err => {
                        console.log(err);
                        callback({
                            code: 'ERR',
                            data: err
                        })
                    })
                },

                function sendNotification(data, callback) {
                    try {
                        data.map((x, i) => {
                            let payloadNotif = {
                                notif: {
                                    title: "target usage notification",
                                    body:  x.data == 1 ? 'usage sudah mendekati target!' : ''
                                },
                                data: {
                                    user_id: x.user_id,
                                    device_key: x.device_key
                                }
                            };
    
                            request.sendNotif(APP.models, payloadNotif, (err, res) => {
                                if (err) throw new Error( err );
    
                                if (i == data.length - 1) {
                                    callback( null, {
                                        code: 'OK',
                                        message: 'Success cronjob reminder usage target',
                                        payloadLog: {
                                            info: 'REMINDER USAGE TARGET',
                                            message: 'Success cronjob reminder usage target',
                                            level: { error: false }
                                        }
                                    });
                                }
                            });
                        });   
                    } catch ( err ) {
                        callback({
                            code: 'ERR',
                            message: 'failed to send notification',
                            payloadLog: {
                                info: 'REMINDER USAGE TARGET',
                                message: 'failed to send notification',
                                level: { error: true }
                            },
                            data: JSON.stringify( err )
                        });
                    }
                }

            ],
            (err, result) => {
                if (err) return output.log(err);

                return output.log(result);
            }
        )
        
    })

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
