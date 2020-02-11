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



























