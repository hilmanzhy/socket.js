"use strict";

const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController.js');

router.post('/connection', (req, res, next) => {
	return req.APP.output.print(req, res, {
		code: 'OK'
	});
});

router.post('/creategroup', (req, res, next) => {
	console.log("creategroup")
	groupController.creategroup(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/updategrouptdl', (req, res, next) => {
	console.log("updategrouptdl")
	groupController.updategrouptdl(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/getdevicegroup', (req, res, next) => {
	console.log("getdevicegroup")
	groupController.getdevicegroup(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/getgroup', (req, res, next) => {
	console.log("getgroup")
	groupController.getgroup(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/assigngroup', (req, res, next) => {
	console.log("assigngroup")
	groupController.assigngroup(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/removegroup', (req, res, next) => {
	console.log("removegroup")
	groupController.removegroup(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/deletegroup', (req, res, next) => {
	console.log("deletegroup")
	groupController.deletegroup(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/grouptotalruntime', (req, res, next) => {
	console.log("grouptotalruntime")
	groupController.grouptotalruntime(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/groupruntime', (req, res, next) => {
	console.log("groupruntime")
	groupController.groupruntime(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/updategroupname', (req, res, next) => {
	console.log("updategroupname")
	groupController.updategroupname(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/groupdailyruntime', (req, res, next) => {
	console.log("groupdailyruntime")
	groupController.groupdailyruntime(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/groupcommand', (req, res, next) => {
	console.log("groupcommand")
	groupController.groupcommand(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/reportgroupcommand', (req, res, next) => {
	console.log("reportgroupcommand")
	groupController.reportgroupcommand(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

module.exports = router;