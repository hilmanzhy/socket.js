"use strict";

const unirest = require('unirest'),
      nodemailer = require('nodemailer'),
      mustache = require('mustache'),
      fs = require('fs'),
      path = require('path');

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
                code : response.body.code,
                message : response.body.message
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

exports.sendEmail = function(params, callback) {
    try {
        let template = fs.readFileSync(
            path.join(__dirname, "../storage/email_templates/", params.html.file),
            "utf8"
        );
        let mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: params.to,
            subject: params.subject,
            html: mustache.render(template, params.html.data)
        };
        let transport = {
            host: String(process.env.EMAIL_HOST),
            port: String(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_PORT == 465 ? true : false,
            auth: {
                user: String(process.env.EMAIL_USER),
                pass: String(process.env.EMAIL_PASSWORD)
            },
            tls: {
                rejectUnauthorized: false
            }
        };

        nodemailer.createTransport(transport).sendMail(mailOptions, (err, info) => {
            if (err) return callback(err);
    
            callback(null, {
                code: "OK",
                message: "Email sent.",
                data: info
            });
        });
    } catch (err) {
        return callback(err);
    }
};

exports.sendNotif = function(models, payload, callback) {
    let url = "https://fcm.googleapis.com/fcm/send",
        params = {
            to: payload.data.device_key,
            notification: {
                title: payload.notif.title,
                body: payload.notif.body,
                tag: payload.notif.tag ? payload.notif.tag : "Default"
            },
            data: payload.data,
            headers: {
                Authorization:
                    "key=AAAApNlKMJk:APA91bH2y94mcN6soiTrMJzZf7t52eiR4cRfUdoNA7lIeCWU_BkzGHApidOHIK5IHfIH_80v_BJ8JfJXPvi1xIUJZjptYKQ56Qu8wxojxDlNxeMbj9SVRm6jwBUjGhQRcskAbLqfcqPZ"
            }
        };

    this.post(url, params, (err, res) => {
        if (err) return callback(err);

        models.mongo.notif.create(
            {
                user_id: params.data.user_id,
                notification: params.notification
            },
            (err, result) => {
                if (err)
                    return callback({
                        code: "ERR_DATABASE",
                        data: JSON.stringify(err)
                    });

                return callback(null, res);
            }
        );
    });
};