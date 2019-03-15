"use strict";

const unirest = require('unirest');
const nodemailer = require('nodemailer');

exports.post = function (url, params, callback) {
	unirest.post(url)
		.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'cache-control': 'no-cache'})
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
	const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html
    };

	nodemailer.createTransport({
        host: String(process.env.EMAIL_HOST),
        port: String(process.env.EMAIL_PORT),
        secure: false,
        auth: {
            user: String(process.env.EMAIL_USER),
            pass: String(process.env.EMAIL_PASSWORD)
	}, tls: {
        rejectUnauthorized: true
        }}).sendMail(mailOptions, (error, info) => {
        if (error) return callback({
            code: 'GENERAL_ERR',
            message: 'Failed to sent email.',
            data: error
        });

        callback(null, {
            code: 'OK',
            message: 'Email sent.',
            data: info
        });
    });
};