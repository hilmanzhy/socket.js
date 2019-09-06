"use strict";

const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController.js');
const testLog = require('../test');
const vsckit  = require('vascommkit');

router.post('/log', (req, res, next) => {
	let payload = {
		info	: 'SCHEDULER DEVICE ON/OFF',
		res		: `TIMER OFF at ${vsckit.time.now()}` + '\n' +
				  `DEVICE ID  : 1` + '\n' +
				  `DEVICE PIN : 1`
	}

	console.log(testLog(payload, payload.res))
})

router.post('/connection', (req, res, next) => {
	return req.APP.output.print(req, res, {
		code: 'OK'
	});
});

router.post('/mysqlGet', (req, res, next) => {
	testController.mysqlGet(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

router.post('/mongoGet', (req, res, next) => {
	testController.mongoGet(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

router.post('/getdevice', (req, res, next) => {
	console.log("getdevice")
	testController.getdevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/registerdevice', (req, res, next) => {
	console.log("registerdevice")
	testController.registerdevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/activatedevice', (req, res, next) => {
	console.log("activatedevice")
	testController.activatedevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/registerkeyword', (req, res, next) => {
	console.log("registerkeyword")
	testController.registerkeyword(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/getid', (req, res, next) => {
	console.log("getid")
	testController.getid(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/devicedetail', (req, res, next) => {
	console.log("devicedetail")
	testController.devicedetail(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/updatename', (req, res, next) => {
	console.log("updatename")
	testController.updatename(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/deletedevice', (req, res, next) => {
	console.log("deletedevice")
	testController.deletedevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/devicehistory', (req, res, next) => {
	console.log("devicehistory")
	testController.devicehistory(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/command', (req, res, next) => {
	console.log("command")
	testController.command(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/status', (req, res, next) => {
	console.log("status")
	testController.status(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/sensordata', (req, res, next) => {
	console.log("sensordata")
	testController.sensordata(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/runtimedashboard', (req, res, next) => {
	console.log("runtimedashboard")
	testController.runtimedashboard(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/runtimedetail', (req, res, next) => {
	console.log("runtimedetail")
	testController.runtimedetail(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/runtimereport', (req, res, next) => {
	console.log("runtimereport")
	testController.runtimereport(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/testingtoken', (req, res, next) => {
	console.log("testingtoken")
	testController.testingtoken(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

router.post('/testing', (req, res, next) => {
	console.log("testing")
	testController.testing(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		console.log(result)
		res.send(result)
		//return req.APP.output.print(req, res, result);
	});
});

module.exports = router;



























