const nodemailer = require('nodemailer')

 let transport = {
        host    : process.env.EMAIL_HOST,
        port    : process.env.EMAIL_PORT,
        secure  : (process.env.EMAIL_PORT == 465) ? true : false,
        debug   : true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls     : {
            rejectUnauthorized: false
        }
    }

exports.send = function (req, callback) {
    let message = {
        from: process.env.EMAIL_SENDER,
        to: req.body.email,
        subject: req.body.subject,
        html: req.body.message
    }

    nodemailer.createTransport(transport).sendMail(message, (err, info) => {
        if (err) callback({
            code    : "MAIL_ERR",
            message : err
        })
        if (info) callback(null, {
            code    : "OK",
            message : info
        })
    })
}