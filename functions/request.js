"use strict";

const unirest = require('unirest');
const nodemailer = require('nodemailer');

exports.post = function (url, params, callback) {
    let headers = {
        'Accept': 'application/json',
        'Content-Type':  'application/json',
        'cache-control': 'no-cache'
    }

    if (params.headers) {
        headers = Object.assign(headers, params.headers)
        delete params.headers
    }

    unirest.post(url)
		.headers(headers)
		.send(params)
		.end(function (response) {
            if (response.error) return callback({
                code : response.code
            });

            callback(null, response.body);
		});
};

exports.soa = function (url, key, callback){
	unirest.post(url)
		.headers({'Accept': 'application/xml','Content-Type': 'application/xml','SOAPAction': 'inquiry'})
		.send(key)
		.end(function (response) {
            if (response.error) {
                if (response.code == 500) return callback(null, response.body);

                callback({
                    code : response.code,
                    message : response.message
                });

            } else {
                callback(null,response.body);
            }
		});
};

exports.sendEmail = function (params, callback) {
	let mailOptions = {
            from    : process.env.EMAIL_SENDER,
            to      : params.to,
            subject : params.subject,
            html    : params.html
        };
    let transport = {
            host    : String(process.env.EMAIL_HOST),
            port    : String(process.env.EMAIL_PORT),
            secure  : (process.env.EMAIL_PORT == 465) ? true : false,
            auth: {
                user: String(process.env.EMAIL_USER),
                pass: String(process.env.EMAIL_PASSWORD)
            },
            tls     : {
                rejectUnauthorized: false
            }
        };

	nodemailer.createTransport(transport).sendMail(mailOptions, (err, info) => {
        if (err) return callback({
            code: 'MAIL_ERR',
            message: 'Failed to sent email.',
            data: err
        });

        callback(null, {
            code: 'OK',
            message: 'Email sent.',
            data: info
        });
    });
};

exports.sendNotif = function (payload, callback) {
    let url = payload.url,
        params = {
            'to'	: payload.data.device_key,
            'notification'	: {
                'title'	: payload.notif.title,
                'body'	: payload.notif.body
            },
            'data'	: payload.data,
            'headers'	: payload.auth
        }

	this.post(url, params, (err, res) => {
		if (err) return callback(err);

		return callback(null, res)
	})
}