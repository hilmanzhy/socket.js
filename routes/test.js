"use strict";

const express = require('express');
const router = express.Router();
const async = require("async");
const fs = require("fs");
const path = require("path");
const encryption = require('../functions/encryption.js');

router.post('/decrypt', (req, res, next) => {
	let decrypted = encryption.decrypt(req.body.encrypted)
	
	return req.APP.output.print(req, res, {
		code: 'OK',
		data: decrypted
	});
})

router.post('/encryptRSA', (req, res, next) => {
	let encrypted = encryption.encryptRSA(req.body)
	
	return req.APP.output.print(req, res, {
		code: 'OK',
		data: encrypted
	});
})

router.post('/decryptRSA', (req, res, next) => {
	if (!req.body.encrypted) return req.APP.output.print(req, res, { code: 'MISSING_KEY' });
	
	let decrypted = encryption.decryptRSA(req.body.encrypted)
	
	return req.APP.output.print(req, res, {
		code: 'OK',
		data: decrypted
	});
})

router.post('/connection', (req, res, next) => {
	return req.APP.output.print(req, res, {
		code: 'OK'
	});
});

router.post("/notif", (req, res, next) => {
    if (!req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.body.title)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "title" }
        });
    if (!req.body.body)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "body" }
        });

    req.APP.models.mysql.user
        .findOne({ where: { user_id: req.body.user_id } })
        .then(user => {
            let params = {
                notif: {
                    title: req.body.title,
                    body: req.body.body,
                    tag: req.body.user_id
                },
                data: {
                    device_key: user.device_key,
                    user_id: user.user_id,
                    data1: "hape",
                    data2: "tv",
                    data3: "internet",
                    click_action : "TEST_DEVICE"
                }
            };

            req.APP.request.sendNotif(req.APP.models, params, (err, response) => {
                if (err) throw err;

                return req.APP.output.print(req, res, {
                    code: "OK",
                    message: "Notif sent"
                });
            });
        })
        .catch(err => {
            if (err.code) return req.APP.output.print(req, res, err);

            return req.APP.output.print(req, res, {
                code: "GENERAL_ERR",
                message: err.message
            });
        });
});

router.post("/email", (req, res, next) => {
    if (!req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.body.subject)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "subject" }
        });

    req.APP.models.mysql.user
        .findOne({ where: { user_id: req.body.user_id } })
        .then(user => {
            if (!user)
                throw {
                    code: "INVALID_REQUEST",
                    message: "User not found!"
                };

            let payload = {
                to      : user.email,
                subject : req.body.subject,
                html    : {
                    file    : 'login.html',
                    data    : {
                        name    : user.name,
                        date    : '2020-20-20 20:20',
                        cdn_url : `${ process.env.APP_URL }/cdn`,
                        platform: req.headers['user-agent']
                    }
                }
            }

            req.APP.request.sendEmail(payload, (err, response) => {
                if (err) return req.APP.output.print(req, res, {
                    code: "GENERAL_ERR",
                    message: err.message
                });

                return req.APP.output.print(req, res, {
                    code: "OK",
                    message: "Email sent!"
                });
            })
        })
        .catch(err => {
            return req.APP.output.print(req, res, {
                code: "GENERAL_ERR",
                message: err.message
            });
        });
});

router.post("/get_cdn", (req, res, next) => {
    try {
        let { folder_name } = req.body;

        let readDir = fs.readdirSync(path.join(
            __dirname,
            `../public/cdn/${folder_name}`
        ))

        return req.APP.output.print(req, res, {
            code: 'OK',
            data: readDir
        });
    } catch (error) {
        return req.APP.output.print(req, res, {
            code: 'GENERAL_ERR',
            message: error.message,
            data: error
        });
    }
})

router.post("/remove_cdn", (req, res, next) => {
    try {
        let { folder_name, file_name } = req.body,
            pathToRemove = path.join(
                __dirname,
                `../public/cdn/${folder_name}/${file_name}`
            );

        if (file_name) fs.unlinkSync(pathToRemove);
        else fs.rmdirSync(pathToRemove);

        return req.APP.output.print(req, res, {
            code: "OK"
        });
    } catch (error) {
        return req.APP.output.print(req, res, {
            code: "GENERAL_ERR",
            message: error.message,
            data: error
        });
    }
});

router.post("/upload_cdn", (req, res, next) => {
    let { folder_name } = req.body;

    async.waterfall(
        [
            function param(callback) {
                if (folder_name) {
                    callback(null, true);
                } else {
                    callback({
                        code: "INVALID_REQUEST",
                        message: "Kesalahan parameter",
                        data: {}
                    });
                }
            },
            function cekFile(data, callback) {
                try {
                    let { mv, name } = req.files.file;

                    callback(null, { mv, name });
                } catch (err) {
                    console.log("ERROR CHECK FILE", err);

                    callback(null, {
                        code: "INVALID_REQUEST",
                        message: "File tidak ada",
                        info: err
                    });
                }
            },
            function(data, callback) {
                let { mv, name } = data;
                let dir = path.join(
                    __dirname,
                    `../public/cdn/${folder_name}/`,
                    name
                );

                mv(dir, (err, res) => {
                    if (err) {
                        callback(null, {
                            code: "INVALID",
                            message: "Gagal upload file",
                            data: err
                        });
                    } else {
                        callback(null, {
                            code: "OK",
                            message: "Success file upload",
                            data: {
                                directory: `/${folder_name}/${name}`
                            }
                        });
                    }
                });
            }
        ],
        (err, result) => {
            return req.APP.output.print(req, res, err || result);
        }
    );
});

module.exports = router;



























