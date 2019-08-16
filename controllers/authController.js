const async = require('async');
      datetime = require('../functions/datetime.js');
      encrypt = require('../functions/encryption.js');
      email = require('../functions/email.js');
      validation = require('../functions/validation.js');

var date = new Date();
    dateFormat = datetime.formatYMD(date)
    queries = {};
    query = {};


exports.login = function (APP, req, callback) {
    const User = APP.models.mysql.user
    let data = req.body
    
    query.attributes = { exclude: ['password', 'created_at', 'updated_at'] }
    query.where = {
        username        : data.username,
        password        : encrypt.encrypt(data.password),
        active_status   : 1
    }

    async.waterfall([
        function validate(callback) {
            if (validation.username(data.username) != true) return callback(validation.username(data.username))
            if (validation.password(data.password) != true) return callback(validation.password(data.password))
            
            callback(null, true)
        },

        function attemptLogin(data, callback) {
            User.findOne(query).then((result) => {
                if (result) {
                    callback(null, result.toJSON())
                    
                    return result 
                } else {
                    return callback({
                        code: 'INVALID_REQUEST',
                        message: 'Invalid username or password!'
                    })
                }
            }).then((user) => {
                if (user) {
                    let emailPayload = {
                        body : {
                            email   : user.email,
                            subject : `${ process.env.APP_NAME } Login on ${ dateFormat }`,
                            message : `Hello, ${ user.name }. Your account just logged in a Devices`
                        }
                    }
                    
                    email.send(emailPayload, (err, res) => {
                        if (err) console.error(err)
                        if (res) console.log(res)
                    })
                }
            }).catch((err) => {
                callback({
                    code: 'ERR_DATABASE',
                    data: JSON.stringify(err)
                });
            })
        },

        function putSession(data, callback) {
            let session = require('../controllers/sessionController.js')            
            req.body = data

            session.put(APP, req, (err, res) => {
                if (err) {
                    return callback({
                        code: err.code,
                        message: err.message
                    })
                }

                let output = {
                    code: '00',
                    message: 'Login success.',
                    data: data
                }
                output.data.session_id = res.data.session_id;

                callback(null, output)
            })
        }
    ], function (err, result) {
        if (err) {
            return callback(err)
        }
        return callback(null, result)
    })
}

exports.register = function (APP, req, callback) {
    const User = APP.models.mysql.user

    async.waterfall([
        function validator(callback) {
            if (validation.name(req.body.name) != true) return callback(validation.name(req.body.name))
            if (validation.username(req.body.username) != true) return callback(validation.username(req.body.username))
            if (validation.password(req.body.password) != true) return callback(validation.password(req.body.password))
            if (validation.email(req.body.email) != true) return callback(validation.email(req.body.email))
            if (validation.phone(req.body.phone) != true) return callback(validation.phone(req.body.phone))
            if (!req.body.tdl_id) return callback({ code: 'MISSING_KEY', data: 'tdl_id' })
            
            callback(null, true)
        },

        function checkExisting(data, callback) {
            queries = APP.queries.select('user.registered', req, APP.models)
            
            User.findOne(queries).then((result) => {
                if (result) {
                    callback({
                        code: 'ERR_DUPLICATE',
                        message: 'Credentials has already been taken!'
                    })
                } else {
                    callback(null, true)
                }
            }).catch((err) => {
                callback({
                    code: 'ERR_DATABASE',
                    data: JSON.stringify(err)
                })
            });
        },

        function encryptPassword(data, callback) {
            req.body.password = encrypt.encrypt(req.body.password)

            callback(null, true)
        },

        function create(data, callback) {
            var query = APP.queries.insert('user', req, APP.models)

            APP.models.mysql.user.create(query).then( (result) => {
                callback(null, {
                    code: 'OK',
                    message: 'Register success.'
                })
            }).catch(err => {
                callback({
                    code: 'ERR_DATABASE',
                    data: JSON.stringify(err)
                })
            })
        }

    ], function (err, result) {
        if (err) {
            return callback(err)
        }
        return callback(null, result)
    })
}

exports.updatekey = function (APP, req, callback) {
    const User = APP.models.mysql.user
	let params = req.body

    console.log(`========== PARAMS ==========`)
	console.log(params)
    
    if(!params.user_id) return callback({ code: 'MISSING_KEY' })
	if(!params.username) return callback({ code: 'MISSING_KEY' })
	if(!params.key) return callback({ code: 'MISSING_KEY' })

	query.value = {
		device_key : params.key
	}
	query.options = {
		where : {
			user_id : params.user_id,
			username : params.username,
		}
	}
	
	// APP.db.sequelize.query("update users set device_key = '" + datareq.key + "' where id_akun = '" + datareq.id_akun + "' and username = '" + datareq.username + "'", { type: APP.db.sequelize.QueryTypes.RAW})
	User.update(query.value, query.options).then((resUpdate) => {
        console.log(`========== RESULT ==========`)
        console.log(resUpdate)
        
        return callback(null, {
			code : 'OK',
			message : 'Update Key Success'
		});
	}).catch((err) => {
		return callback({
			code: 'ERR_DATABASE',
			data: JSON.stringify(err)
		});
	});
	
};

exports.checkuser = function (APP, req, callback) {
    const params    = req.body
    const User      = APP.models.mysql.user

    if(Object.keys(params).length!=1) return callback({
        code    : 'INVALID_REQUEST',
        message : 'Input only 1 request.'
    })

    if (params.username || params.email || params.phone) {
        query.where = params
        
        User.findOne(query).then((result) => {
            if (result) {
                callback({
                    code : 'ERR_DUPLICATE',
                    data : params
                })
            } else {
                callback(null, {
                    code : 'AVAILABLE',
                    data : params
                })
            }
        }).catch((err) => {
            callback({
                code: 'ERR_DATABASE',
                data: JSON.stringify(err)
            })
        })
    } else {
        callback({ code: 'MISSING_KEY' })
    }
}