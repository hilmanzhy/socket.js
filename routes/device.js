"use strict";

const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController.js');

router.post('/connection', (req, res, next) => {
	return req.APP.output.print(req, res, {
		code: 'OK'
	});
});

router.post('/mysqlGet', (req, res, next) => {
	deviceController.mysqlGet(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

router.post('/mongoGet', (req, res, next) => {
	deviceController.mongoGet(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

router.post('/getdevice', (req, res, next) => {
	console.log("========== ENDPOINT = /getdevice ==========")
	deviceController.getdevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/registerdevice', (req, res, next) => {
	console.log("registerdevice")
	deviceController.registerdevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/activatedevice', (req, res, next) => {
	console.log("activatedevice")
	deviceController.activatedevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/deactivatedevice', (req, res, next) => {
	console.log("deactivatedevice")
	deviceController.deactivatedevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/registerkeyword', (req, res, next) => {
	console.log("registerkeyword")
	deviceController.registerkeyword(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/getid', (req, res, next) => {
	console.log("getid")
	deviceController.getid(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/devicedetail', (req, res, next) => {
	console.log("devicedetail")
	deviceController.devicedetail(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/pindetail', (req, res, next) => {
	console.log("pindetail")
	deviceController.pindetail(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/updatename', (req, res, next) => {
	console.log("updatename")
	deviceController.updatename(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/deletedevice', (req, res, next) => {
	console.log("deletedevice")
	deviceController.deletedevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/devicehistory', (req, res, next) => {
	console.log("devicehistory")
	deviceController.devicehistory(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/command', (req, res, next) => {
	console.log("command")
	deviceController.command(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/status', (req, res, next) => {
	console.log("status")
	deviceController.status(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/sensordata', (req, res, next) => {
	console.log("sensordata")
	deviceController.sensordata(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/runtimereportperday', (req, res, next) => {
	console.log("runtimereportperday")
	deviceController.runtimereportperday(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/runtimereportperdev', (req, res, next) => {
	console.log("runtimereportperdev")
	deviceController.runtimereportperdev(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/runtimereportdaily', (req, res, next) => {
	console.log("runtimereportdaily")
	deviceController.runtimereportdaily(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/runtimereport', (req, res, next) => {
	console.log("runtimereport")
	deviceController.runtimereport(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/totalruntime', (req, res, next) => {
	console.log("totalruntime")
	deviceController.totalruntime(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/testingtoken', (req, res, next) => {
	console.log("testingtoken")
	deviceController.testingtoken(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/getpindevice', (req, res, next) => {
	console.log("getpindevice")
	deviceController.getpindevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/testing', (req, res, next) => {
	console.log("testing")
	deviceController.testing(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/commandpanel', (req, res, next) => {
	console.log("commandpanel")
	deviceController.commandpanel(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/ipupdate', (req, res, next) => {
	console.log("ipupdate")
	deviceController.ipupdate(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/regischeck', (req, res, next) => {
	console.log("regischeck")
	deviceController.regischeck(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/updateusertdl', (req, res, next) => {
	console.log("updateusertdl")
	deviceController.updateusertdl(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/activateallpin', (req, res, next) => {
	console.log("activateallpin")
	deviceController.activateallpin(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/getpagingdevice', (req, res, next) => {
	console.log("getpagingdevice")
	deviceController.getpagingdevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/getpaginghistory', (req, res, next) => {
	console.log("getpaginghistory")
	deviceController.getpaginghistory(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

/* Route Device Timer */
router.post('/timer/set', (req, res, next) => {
	console.log("========== ENDPOINT = /timer/set ==========")
	deviceController.settimer(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/timer/switch', (req, res, next) => {
	console.log("========== ENDPOINT = /timer/switch ==========")
	deviceController.switchtimer(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/timer/remove', (req, res, next) => {
	console.log("========== ENDPOINT = /timer/remove ==========")
	deviceController.removetimer(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

/* Route Command Socket */
router.post('/commandsocket', (req, res, next) => {
	console.log("=========== ENDPOINT /commandsocket ===========")

	deviceController.commandsocket(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

module.exports = router;
