"use strict";

const express = require('express');
const router = express.Router();
const lumensensorController = require('../controllers/lumensensorController.js');

router.post('/connection', (req, res, next) => {
	return req.APP.output.print(req, res, {
		code: 'OK'
	});
});

router.post('/mysqlGet', (req, res, next) => {
	lumensensorController.mysqlGet(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

router.post('/mongoGet', (req, res, next) => {
	lumensensorController.mongoGet(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

/* Route Lumen Sensor */
router.post('/set', (req, res, next) => {
	console.log("========== ENDPOINT = /set ==========")
	lumensensorController.setlumensensor(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/switch', (req, res, next) => {
	console.log("========== ENDPOINT = /switch ==========")
	lumensensorController.switchlumensensor(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/switchall', (req, res, next) => {
	console.log("========== ENDPOINT = /switchall ==========")
	lumensensorController.switchall(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/remove', (req, res, next) => {
	console.log("========== ENDPOINT = /remove ==========")
	lumensensorController.removelumensensor(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/lumensensordata', (req, res, next) => {
	console.log("========== ENDPOINT = /lumensensordata ==========")
	lumensensorController.lumensensordata(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/setall', (req, res, next) => {
	console.log("========== ENDPOINT = /setall ==========")
	lumensensorController.setall(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/removeall', (req, res, next) => {
	console.log("========== ENDPOINT = /removeall ==========")
	lumensensorController.removeall(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

module.exports = router;