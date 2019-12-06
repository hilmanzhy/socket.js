"use strict";

const express = require('express');
const router = express.Router();
const encryption = require('../functions/encryption.js');

router.post('/encrypt', (req, res, next) => {
	let encrypted = encryption.encryptRSA(req.body)
	
	return req.APP.output.print(req, res, {
		code: 'OK',
		data: encrypted
	});
})

router.post('/decrypt', (req, res, next) => {
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

module.exports = router;



























