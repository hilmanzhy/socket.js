function generateOTP() {
    let digits = '0123456789',
        OTPLength = 4,
        OTP = '';

    for (let i = 0; i < OTPLength; i++) {
        OTP += digits[Math.floor(Math.random() * digits.length)];
    }

    return OTP;
}

exports.create = function (APP, req, callback) {
    req.body.otp = generateOTP()

    APP.models.mongo.otp.updateOne(
		{ email : req.body.email },
		{ $set : { otp : req.body.otp } },
		{ upsert : true },
	    function(err, result){
	        if (err){
				return callback(err);
	        } else {
                result.email = req.body.email
                result.otp = req.body.otp
                
	            callback(null, result);
	        }
        }
    )
}

exports.validate = function (APP, req, callback) {
    APP.models.mongo.otp.findOne({
        email : req.body.email,
        otp : req.body.otp
    }).then((rows) => {
        if (rows) {
            APP.models.mongo.otp.deleteOne(rows, (err, info) => {
                if (err) return callback({ code : 'DATABASE_ERR', message : 'Failed delete OTP!' })

                callback(null, info);
            })

        } else {
            return callback({ code : 'OTP_ERR', message : 'OTP not match!' })
        }

    })
}