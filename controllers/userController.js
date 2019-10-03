const async = require('async')
      session = require('../functions/session.js');
      validation = require('../functions/validation.js');

let query   = {}
    output  = {}

exports.get = function (APP, req, callback) {
    let User = APP.models.mysql.user
    
    async.waterfall([
        function (callback) {
            session.check(APP, req, (err, result) => {
                if (err) return callback({ code: err.code })
                
                callback(null, result)
              
            })
        },

        function (data, callback) {
            req.body = { username : data.username }
            queries = APP.queries.select('user.get', req, APP.models)

            User.findOne(queries).then((result) => {
                callback(null, {
                    code : 'OK',
                    data : result
                })
            }).catch((err) => {
                callback({
                    code: 'ERR_DATABASE',
                    data: JSON.stringify(err)
                })
            })
        }
    ], function (err, result) {
        if (err) {
            return callback(err)
        } else {
            return callback(null, result)
        }
    })
}

exports.update = function (APP, req, callback) {
    const User = APP.models.mysql.user

    async.waterfall([
        function validator(callback) {
            if (validation.name(req.body.name) != true) return callback(validation.name(req.body.name))
            if (validation.email(req.body.email) != true) return callback(validation.email(req.body.email))
            if (validation.phone(req.body.phone) != true) return callback(validation.phone(req.body.phone))
            if (!req.body.tdl_id) return callback({ code: 'MISSING_KEY', data: 'tdl_id' })

            session.check(APP, req, (err, result) => {
                if (err) return callback({ code: err.code })
                
                callback(null, result)
            })
        },

        function create(data, callback) {
            query.value = req.body
            query.options = {
                where : {
                    username : data.username
                }
            }

            User.update(query.value, query.options).then((resUpdate) => {
                console.log(`========== RESULT ==========`)
                console.log(resUpdate)
                
                callback(null, {
                    code : 'OK',
                    message : 'Update User Success'
                });
            }).catch(e => {
                callback({
                    code : 'ERR_DATABASE',
                    message : JSON.stringify(e)
                });
            });
        }

    ], function (err, result) {
        if (err) {
            return callback(err)
        }
        return callback(null, result)
    })
}

exports.pricing = function (APP, req, callback) {
    let Pricing = APP.models.mysql.pricing
        params  = req.body

    console.log(params)

    async.waterfall([
        function (callback) {
            if (!params.meter_type) return callback({ code : 'MISSING_KEY', data : 'meter_type' })
            if (!params.allocation) return callback({ code : 'MISSING_KEY', data : 'allocation' })

            query = { where : params }

            callback(null, query)
        },
        function (query, callback) {
            Pricing.findAll(query).then(dataPricing => {
                callback(null, {
                    code    : (dataPricing && (dataPricing.length > 0)) ? 'FOUND' : 'NOT_FOUND',
                    data    : dataPricing
                });
            }).catch(e => {
                callback({
                    code    : 'ERR_DATABASE',
                    data    : JSON.stringify(e)
                })
            })
        }
    ], (err, result) => {
        if (err) return callback(err)
        
        return callback(null, result)
    })
}