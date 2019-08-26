function generate() {
    let digits = '0123456789',
        OTPLength = 4,
        OTP = '';

    for (let i = 0; i < OTPLength; i++) {
        OTP += digits[Math.floor(Math.random() * digits.length)];
    }

    return OTP;
}

exports.create = function (APP, req, callback) {
    req.body.otp = generate()

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
    APP.models.mongo.otp.find({
        email : req.body.email,
        otp : req.body.otp
    }, function(err, result) {
        if (err) {
            return callback({ code : 'OTP_ERR', message : err });
        } else if (result.length > 0) {
            callback(null, result);
        } else {
            return callback({ code : 'OTP_ERR', message : 'OTP not match!' })
        }
    })
}