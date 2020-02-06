const async = require('async'),
      datetime = require('../functions/datetime.js'),
      encrypt = require('../functions/encryption.js'),
      otp = require('../functions/otp.js'),
      request = require('../functions/request.js'),
      roles = require('../functions/roles.js'),
      session = require('../functions/session.js'),
      validation = require('../functions/validation.js');

const User = APP => {
    return APP.models.mysql.user;
};
const Token = APP => {
    return APP.models.mongo.token_verification;
};

var date = new Date(),
    dateFormat = datetime.formatYMD(date),
    queries = {},
    query = {};

exports.login = function (APP, req, callback) {
    const User = APP.models.mysql.user
    let data = req.body
    
    query = {
        attributes : { exclude: ['password', 'created_at', 'updated_at'] },
        include: 'user_level',
        where : {
            username        : data.username,
            password        : encrypt.encrypt(data.password),
            active_status   : 1
        }
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
                    let payload = {
                        to      : user.email,
                        subject : `Your ${ process.env.APP_NAME } account, Login on ${ dateFormat }`,
                        html    : `Hello, ${ user.name }. Your account just logged in`    
                    }
                    
                    request.sendEmail(payload, (err, res) => {
                        if (err) console.error(err)
                        if (res) console.log(`EMAIL SENT!`)
                    })
                }
            }).catch((err) => {
                callback({
                    code: 'ERR_DATABASE',
                    data: JSON.stringify(err)
                });
            })
        },

        function getRole(data, callback) {
            let mapFeature = roles.feature(req, data.user_level.level_previledge)
            
            Promise.all(mapFeature).then((result) => {
                data.user_level = result.filter(Boolean)

                callback(null, data)
            }).catch((err) => {
                callback({
                    code: 'GENERAL_ERR',
                    data: JSON.stringify(err)
                });
            });
        },

        function putSession(data, callback) {
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
                    message: 'Login success',
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

exports.logout = function (APP, req, callback) {
    const User = APP.models.mysql.user

    async.waterfall([
        function checkExisting(callback) {
            session.check(APP, req, (err, res) => {
                if (err) { return callback(err) }

                callback(null, res)
            })
        },

        function deleteSession(data, callback) {
            session.delete(APP, req, (err, res) => {
                if (err) { return callback(err) }

                callback(null, data)
            })
        },

        function removeDeviceKey(data, callback) {
            query.find = {
                where : { username: data.username }
            }
            query.update = { device_key: null }

            User.update(query.update, query.find).then((result) => {
                callback(null, {
                    code: '00',
                    message: 'Logout success'
                })
            }).catch((e) => {
                return callback(e)
            })
        }
    ], function (err, res) {
        if (err) {
            return callback(err)
        }
        return callback(null, res)
    })
}

exports.register = function (APP, req, callback) {
    async.waterfall([
        function validator(callback) {
            if (validation.name(req.body.name) != true) return callback(validation.name(req.body.name))
            if (validation.username(req.body.username) != true) return callback(validation.username(req.body.username))
            if (validation.password(req.body.password) != true) return callback(validation.password(req.body.password))
            if (validation.email(req.body.email) != true) return callback(validation.email(req.body.email))
            if (validation.phone(req.body.phone) != true) return callback(validation.phone(req.body.phone))
            if (!req.body.tdl_id) return callback({ code: 'MISSING_KEY', data: { parameter : 'tdl_id' } })
            if (!req.headers['session-key']) return callback({ code: 'INVALID_HEADERS' })

            callback(null, true)
        },

        function checkExisting(data, callback) {
            queries = APP.queries.select('user.registered', req, APP.models)
            
            User(APP)
                .findOne(queries)
                .then(result => {
                    if (result) {
                        let output = {
                            code: "ERR_DUPLICATE",
                            message: "Credentials has already been taken!",
                            data: {}
                        };

                        if (result.username == req.body.username)
                            output.data.parameter = "username";
                        if (result.email == req.body.email)
                            output.data.parameter = "email";
                        if (result.phone == req.body.phone)
                            output.data.parameter = "phone";

                        return callback(output);
                    }

                    callback(null, true);
                })
                .catch(err => {
                    callback({
                        code: "ERR_DATABASE",
                        data: JSON.stringify(err)
                    });
                });
        },

        function encryptPassword(data, callback) {
            req.body.password = encrypt.encrypt(req.body.password)

            callback(null, true)
        },

        function create(data, callback) {
            var query = APP.queries.insert('user', req, APP.models)
            
            switch (req.get('session-key')) {
                case 'apps':
                    query.level_id = '3'
                    break;
            
                case 'web':
                    query.level_id = '2'
                    break;
            }
            
            User(APP)
                .create(query)
                .then((user) => {
                    callback(null, 'OK')
                })
                .catch(err => {
                    callback({
                        code: 'ERR_DATABASE',
                        data: JSON.stringify(err)
                    })
                })
        },

        function (status, callback) {
            queries = APP.queries.select('user.registered', req, APP.models)

            User(APP)
                .findOne(queries)
                .then((user) => {
                    req.body = user
                    
                    sendLink(APP, req, (err, res) => {
                        if (err) callback(err)
                        else callback(null, {
                            code: 'OK',
                            message: 'Register success, please verify your email.'
                        })
                    });
                })
                .catch(err => {
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

exports.verifyemail = function (APP, req, callback) {
    query.where = req.query

    APP.models.mongo.token_verification.findOne(query.where).then((result) => {
        if (result) {
            query = {
                options : { where : { user_id : result.user_id } },
                value : {
                    verify_status : 1,
                    verify_date : date
                }
            }
            
            APP.models.mysql.user.update(query.value, query.options).then((resUpdate) => {
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
        }
    }).catch((err) => {
        return callback({
            code: 'ERR_DATABASE',
            message: 'Err find token',
            data: JSON.stringify(err)
        })
    });
}

exports.verify = function(APP, req, callback) {
    switch (req.body.type) {
        case "SEND_LINK":
            sendLink(APP, req, (err, res) => {
                if (err) callback(err);
                else callback(null, res);
            });
            break;
        case "VERIFY_LINK":
            break;

        default:
            break;
    }
};

exports.changepassword = function (APP, req, callback) {
    async.waterfall([
        function validateRequest(callback) {
            if (validation.password(req.body.old_password) != true) return callback(validation.password(req.body.old_password))
            if (validation.password(req.body.new_password) != true) return callback(validation.password(req.body.new_password))

            callback(null, true)
        },
        function getSession(data, callback) {
            session.check(APP, req, (err, result) => {
                if (err) return callback(err)
                
                callback(null, result)
            })
        },
        function encryptPassword(data, callback) {
            data.encrypted = {
                old_password : encrypt.encrypt(req.body.old_password),
                new_password : encrypt.encrypt(req.body.new_password)
            }

            callback(null, data)
        },
        function checkPassword(data, callback) {
            query.options = {
                where : {
                    username        : data.username,
                    password        : data.encrypted.old_password
                }
            }

            APP.models.mysql.user.findOne(query.options).then((user) => {
                if (!user) return callback({ code: 'INVALID_REQUEST', message: 'Invalid old password!' })
                if (data.encrypted.old_password == data.encrypted.new_password) return callback({ code : "INVALID_REQUEST", message : "New password cannot be the same as the Old password" })

                callback(null, data)
            })
        },
        function updateNewPassword(data, callback) {
            query.value = { password : data.encrypted.new_password }

            APP.models.mysql.user.update(query.value, query.options).then((user) => {
                callback(null, {
                    code    : 'OK',
                    message : 'Success change password.'
                })
            }).catch((err) => {
                callback({
                    code    : 'ERR_DATABASE',
                    message : 'Failed change password',
                    data : JSON.stringify(err)
                })
            })
        }
    ], function (err, result) {
        if (err) return callback(err)

        return callback(null, result)
    })
}

exports.forgotpassword = function (APP, req, callback) {
    async.waterfall([
        function validateRequest(callback) {
            if (!req.body.email) return callback({ code: 'MISSING_KEY', data: 'email' });

            query.options = {
                where : req.body
            }
            
            APP.models.mysql.user.findOne(query.options).then((user) => {
                if (!user) {
                    return callback({ code : 'INVALID_REQUEST', message : 'User not found!' })
                }

                callback(null, true)
            })

        },

        function createOTP(validate, callback) {
            otp.create(APP, req, (err, result) => {
                if (err) return callback(err)
                
                callback(null, result)
            })
        },

        function sendOTP(otp, callback) {
            let payload = {
                to      : otp.email,
                subject : `OTP Forgot Password`,
                html    :
                    `<p>Use this OTP to reset your password account</p>
                    <h2>${otp.otp}</h2>`
            }

            request.sendEmail(payload, (err, res) => {
                if (err) return callback({ code : 'OTP_ERR', message : err })

                callback(null, {
                    code: 'OK',
                    message: 'OTP Sent! Please check your email.'
                })
            })
        }
    ], function (err, result) {
        if (err) return callback(err)

        return callback(null, result)
    })
}

exports.resetpassword = function (APP, req, callback) {
    async.waterfall([
        function validateRequest(callback) {
            if (validation.email(req.body.email) != true) return callback(validation.email(req.body.email))
            if (validation.password(req.body.password) != true) return callback(validation.password(req.body.password))
            if (!req.body.otp) return callback({ code : 'MISSING_KEY', data : 'otp' })

            callback(null, true)
        },

        function checkOTP(validate, callback) {
            req.body.otp_checked = true

            otp.validate(APP, req, (err, result) => {
                if (err) return callback(err)
                
                callback(null, result)
            })
        },

        function updatePassword(otp, callback) {
            query.value = {
                password : encrypt.encrypt(req.body.password)
            }
            query.options = {
                where : {
                    email : req.body.email
                }
            }
            
            APP.models.mysql.user.update(query.value, query.options).then((user) => {
                console.log(user);

                callback(null, {
                    code    : 'OK',
                    message : 'Success change password.'
                })
            }).catch((err) => {
                callback({
                    code    : 'ERR_DATABASE',
                    message : 'Failed change password',
                    data : JSON.stringify(err)
                })
            })
        }
    ], function (err, result) {
        if (err) return callback(err)

        return callback(null, result)
    })
}

exports.checkotp = function (APP, req, callback) {
    if (!req.body.email) return callback({ code : 'MISSING_KEY', data: { parameter: 'email' } })
    if (!req.body.otp) return callback({ code : 'MISSING_KEY', data: { parameter: 'otp' } })
    
    otp.validate(APP, req, (err, result) => {
        if (err) return callback(err)
        
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
	
}

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

function sendLink(APP, req, callback) {
    let auth = req.auth || req.body;

    console.log("AUTH", auth);

    query.where = { user_id: auth.user_id };
    query.attributes = [
        "user_id",
        "username",
        "name",
        "email",
        "verify_status"
    ];

    async.waterfall(
        [
            function dataScanner(callback) {
                User(APP)
                    .findOne(query)
                    .then(result => {
                        if (!result)
                            callback({
                                code: "NOT_FOUND"
                            });
                        else if (result.verify_status != "0")
                            callback({
                                code: "GENERAL_ERR",
                                message: "User already verified!"
                            });
                        else callback(null, result);
                    })
                    .catch(err => {
                        callback({
                            code: "ERR_DATABASE",
                            message: err.message
                        });
                    });
            },

            function creatingToken(dataUser, callback) {
                dataUser.token = encrypt.token();

                Token(APP).updateOne(
                    { user_id: dataUser.user_id },
                    {
                        username: dataUser.username,
                        name: dataUser.name,
                        email: dataUser.email,
                        token: dataUser.token
                    },
                    { upsert: true },

                    function(err, res) {
                        if (err || !res)
                            callback({
                                code: "ERR_DATABASE",
                                message: err.message
                            });
                        else callback(null, dataUser);
                    }
                );
            },

            function sendEmail(dataUser, callback) {
                let urlToken = `${process.env.APP_URL}/auth/verify?token=${dataUser.token}`;
                let payload = {
                    to: dataUser.email,
                    subject: `Verify your email address`,
                    html: `<p>To complete your sign up, please verify your email address</p>
                    <a href=${urlToken}>VERIFY</a>`
                };

                request.sendEmail(payload, (err, res) => {
                    if (err)
                        callback({
                            code: "MAIL_ERR",
                            message: err.message
                        });
                    else callback(null, res);
                });
            }
        ],
        (err, res) => {
            if (err) callback(err);
            else callback(null, res);
        }
    );
}