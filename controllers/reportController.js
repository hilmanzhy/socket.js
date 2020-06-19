
const moment = require('moment');
const async = require('async');
const sequelize = require('sequelize');

exports.reportHistory = ( APP, req, callback ) => {
    let { report_history } = APP.models.mysql;

    report_history
        .findAll({
            attributes: ['id','user_id','total_kwh','total_rp','year','month'],
            order: [
                ['month','DESC']
            ],
            where: {
                year: moment().format('YYYY'),
                user_id: req.auth.user_id
            }
        })
        .then(res => {
            callback( null, {
                code: res.length > 0 ? 'OK' : 'NOT_FOUND',
                message: res.length > 0 ? 'Data ditemukan' : 'Data tidak ditemukan',
                data: res
            });
        })
        .catch(err => {
            callback({
                code: "ERR_DATABASE",
                message: 'Error database',
                data: JSON.stringify( err )
            });
        });
};

exports.changeUsageTarget = (APP, req, callback) => {
    let query = {};

    async.waterfall(
        [
            function validateRequest(callback) {
                if (validation.number(req.body.usage_target) != true) 
                    return callback({
                        code: 'INVALID_REQUEST',
                        data: {
                            invalid_parameter: 'usage_target'
                        }
                    })
    
                callback(null, true)
            },
    
            function getSession(data, callback) {                
                session.check(APP, req, (err, result) => {
                    if (err) return callback(err)
                    
                    callback(null, result)
                })
            },
    
            function getUserInfo(data ,callback) {                
                query.options = {
                    where: {user_id: req.auth.user_id}
                }
    
                APP.models.mysql.user
                    .findOne(query.options)
                    .then(user => {   
                        console.log(user);
                                             
                        if (!user) return callback({code: 'INVALID_REQUEST', message: 'User not found!'});
    
                        callback(null, user);
                    })
                    .catch(err => {
                        console.log(err);
                        callback({
                            code: 'ERR_DATABASE',
                            data: err
                        })
                    })
            },
    
            function changeUsageTarget(data, callback) {                
                APP.models.mysql.user
                    .update({
                        usage_target: req.body.usage_target
                    }, query.options)
                    .then(res => {
                        callback(null, {
                            code: 'OK',
                            message: 'Usage target added!'
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        callback({
                            code: 'ERR_DATABASE',
                            data: err
                        })
                    })
            }
        ],
        (err, result) => {
            if (err) return callback(err)
    
            return callback(null, result)
        }
    )
};

exports.setNotifUsageTarget = (APP, req, callback) => {
    let query = {};

    async.waterfall(
        [
            function validateRequest(callback) {
                if (validation.number(req.body.notif) != true) 
                    return callback({
                        code: 'INVALID_REQUEST',
                        data: {
                            invalid_parameter: 'notif'
                        }
                    })
    
                callback(null, true)
            },
    
            function getSession(data, callback) {                
                session.check(APP, req, (err, result) => {
                    if (err) return callback(err)
                    
                    callback(null, result)
                })
            },
    
            function getUserInfo(data ,callback) {                
                query.options = {
                    where: {user_id: req.auth.user_id}
                }
    
                APP.models.mysql.user
                    .findOne(query.options)
                    .then(user => {   
                        console.log(user);
                                             
                        if (!user) return callback({code: 'INVALID_REQUEST', message: 'User not found!'});
    
                        callback(null, user);
                    })
                    .catch(err => {
                        console.log(err);
                        callback({
                            code: 'ERR_DATABASE',
                            data: err
                        })
                    })
            },
    
            function setNotif(data, callback) {                
                APP.models.mysql.user
                    .update({
                        notif_usage_target: req.body.notif
                    }, query.options)
                    .then(res => {
                        callback(null, {
                            code: 'OK',
                            message: 'Notif Usage target set!'
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        callback({
                            code: 'ERR_DATABASE',
                            data: err
                        })
                    })
            }
        ],
        (err, result) => {
            if (err) return callback(err)
    
            return callback(null, result)
        }
    )
}