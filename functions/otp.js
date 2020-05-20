const // External Library
      async = require('async'),
      vascommkit = require('vascommkit'),
      // Internal Library
      datetime = require('../functions/datetime.js'),
      // Declare Variable
      OTP = (APP) => APP.models.mongo.otp,
      dateNow = new Date()

/**
 * Generate OTP
 */
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

    async.waterfall([
        /**
         * Check Existing OTP
         * @param {err, res} callback 
         */
        function checkExisting(callback) {
            OTP(APP).findOne(
                { email : req.body.email },
                (err, result) => {
                    if (result) {
                        // Date & time declaration
                        let dateOTP = result.date,
                            requestLimit = parseInt(process.env.OTP_REQUEST_LIMIT),
                            requestUnit = process.env.OTP_REQUEST_UNIT,
                            timeDiff = parseInt(datetime.timeDiff(dateOTP, dateNow, requestUnit));
                        
                        // If request OTP before, less than terms
                        if (timeDiff < requestLimit) return callback({ message: "Wait a minute to request new OTP!" });
                    }

                    callback();

                    return;
                }
            )
        },

        /**
         * Generate & Store OTP to Database
         * @param {err, res} callback 
         */
        function create(callback) {
            OTP(APP).updateOne(
                { email : req.body.email },
                {
                    otp : req.body.otp,
                    failed_attempt : 0,
                    date : vascommkit.time.now()
                },
                { upsert : true },
                (err, result) => {
                    if (err){
                        return callback(err);
                    } else {
                        result = {};
                        result.email = req.body.email;
                        result.otp = req.body.otp;
                        
                        callback(null, result);
                    }
                }
            )
        }
    ], (err, res) => {
        if (err && err.code) return callback(err);
        else if (err) return callback({
            code: "OTP_ERR",
            message: err.message || err
        }) 

        callback(null, res);

        return;
    })
}

exports.validate = function (APP, req, callback) {
    OTP(APP).findOne({
        email : req.body.email,
        otp : req.body.otp
    }).then((rows) => {
        if (!rows) return callback({ code : 'OTP_ERR', message : 'OTP not match!' })

        let expiredDuration = parseInt(process.env.OTP_EXPIRED_DURATION),
            expiredUnit = process.env.OTP_EXPIRED_UNIT,
            timeDiff = parseInt(datetime.timeDiff(rows.date, dateNow, expiredUnit));

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
    OTP(APP).deleteOne(params, (err, info) => {
        if (err) return callback({ code : 'DATABASE_ERR', message : 'Failed delete OTP!' })
    })

    return callback(null, true)
}