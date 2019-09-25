const vascommkit = require('vascommkit'),
      datetime = require('../functions/datetime.js');

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
		{
            otp : req.body.otp,
            date : vascommkit.time.now()
        },
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
        if (!rows) return callback({ code : 'OTP_ERR', message : 'OTP not match!' })

        let today = new Date(),
            expiredDuration = parseInt(process.env.OTP_EXPIRED_DURATION),
            expiredUnit = process.env.OTP_EXPIRED_UNIT,
            timeDiff = parseInt(datetime.timeDiff(rows.date, today, expiredUnit));

        if (timeDiff > expiredDuration) return callback({ code : 'OTP_ERR', message : 'OTP Expired!' })
        
        if (req.body.otp_checked) deleteOTP(APP, rows, (err, res) => { if (err) return callback(err) })
                
        return callback(null, {
            code    : 'OK',
            message : 'OTP match',
            data    : {
                "email" : req.body.email,
                "otp"   : req.body.otp
            }
        })        
    })
}

function deleteOTP(APP, params, callback) {
    APP.models.mongo.otp.deleteOne(params, (err, info) => {
        if (err) return callback({ code : 'DATABASE_ERR', message : 'Failed delete OTP!' })
    })

    return callback(null, true)
}