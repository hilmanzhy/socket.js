const async = require('async');
const encrypt = require('../functions/encryption.js');
const validation = require('../functions/validation.js');
const session = require('../controllers/sessionController.js');

var queries = {};
var query = {};

exports.user = function (APP, req, callback) {
    const User = APP.models.mysql.user
    
    async.waterfall([
        function (callback) {
            session.check(APP, req, (err, result) => {
                if (err) {
                    callback({
                        code: err.code
                    })
                } else {
                    callback(null, result)
                }
            })
        },

        function (data, callback) {
            req.body = { username : data.username }
            queries = APP.queries.select('user.get', req, APP.models)

            User.findOne(queries).then((result) => {
                callback(null, {
                    code : 'FOUND',
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
            User.findOne(query).then( (result) => {
                if (result) {
                    callback(null, result.toJSON())            
                } else {
                    return callback({
                        code: 'INVALID_REQUEST',
                        message: 'Invalid username or password!'
                    })
                }
            }).catch(err => {
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
            
            callback(null, true)
        },

        function checkExisting(data, callback) {
            queries = APP.queries.select('user.registered', req, APP.models)
            
            User.findOne(queries).then((result) => {
                if (result) {
                    callback({
                        code: 'ERR_DUPLICATE',
                        message: 'Email or username has already been taken!'
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

exports.generatePassword = function (APP, req, callback) {
    if(!req.body.password) return callback({ code: 'INVALID_REQUEST' })

    encrypted = encrypt.encrypt(req.body.password)

    return callback(null, {
        code: 'OK',
        data: {
            ori_password: req.body.password,
            enc_password: encrypted
        }
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

exports.updateuser = function (APP, req, callback) {
    const User = APP.models.mysql.user

    if(!req.body.name) return callback({ code: 'MISSING_KEY' })
	if(!req.body.username) return callback({ code: 'MISSING_KEY' })
	if(!req.body.tdl) return callback({ code: 'MISSING_KEY' })
	if(!req.body.power) return callback({ code: 'MISSING_KEY' })

    async.waterfall([
        function validator(callback) {
            if (validation.name(req.body.name) != true) return callback(validation.name(req.body.name))
            callback(null, true)
        },

        function create(data, callback) {
            const users = APP.models.mysql.user

            query.value = {
                name : req.body.name,
                tdl : req.body.tdl,
                power : req.body.power
            }
            query.options = {
                where : {
                    user_id : req.body.user_id
                }
            }

            users.findAll(query.options).then((result) => {
                if (result.length > 0) {
                    users.update(query.value, query.options).then((resUpdate) => {
                        console.log(`========== RESULT ==========`)
                        console.log(resUpdate)
                        
                        return callback(null, {
                            code : 'OK',
                            message : 'Update User Success'
                        });
                    });
                } else {
                    return callback(null, {
                        code : 'NOT_FOUND',
                        message : 'User Not Found'
                    });
                }
          }).catch((err) => {
                return callback({
                    code: 'ERR_DATABASE',
                    data: JSON.stringify(err)
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

exports.getuser = function (APP, req, callback) {
    const params = req.body
    const users = APP.models.mysql.user
    
    if(!params.user_id) return callback({ code: 'MISSING_KEY' })
    
    query.where = { user_id : params.user_id }
		query.attributes = { exclude: ['created_at', 'updated_at', 'password', 'email'] }
    
        users.findAll(query).then((result) => {
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

exports.checkuser = function (APP, req, callback) {
    const params = req.body
    const User = APP.models.mysql.user

    if(Object.keys(params).length!=1) return callback({ code: 'INVALID_REQUEST' })

    if (params.username || params.email) {
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