"use strict";

const // External Library
	  express = require('express'),
	  router = express.Router(),
	  vascommkit = require('vascommkit'),
	  // Internal Library
	  valid = require('../functions/validation.js'),
	  // Declare Variable
	  deviceController = require('../controllers/deviceController.js');

router.post("/getdevice", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    // if (req.body.install_date_from && !req.body.install_date_to) {
    //     return req.APP.output.print(req, res, {
    //         code: "MISSING_KEY",
    //         data: { missing_parameter: "install_date_to" }
    //     });
    // }
    // if (!req.body.install_date_from && req.body.install_date_to) {
    //     return req.APP.output.print(req, res, {
    //         code: "MISSING_KEY",
    //         data: { missing_parameter: "install_date_from" }
    //     });
    // }
    if (!req.auth) req.auth = { user_id: req.body.user_id };
    delete req.body.user_id;

    deviceController.getdevice(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/getpindevice", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.body.device_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "device_id" }
        });
    if (req.body.install_date_from && !req.body.install_date_to) {
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "install_date_to" }
        });
    }
    if (!req.body.install_date_from && req.body.install_date_to) {
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "install_date_from" }
        });
    }
    if (!req.auth) req.auth = { user_id: req.body.user_id };
    delete req.body.user_id;

    deviceController.getpindevice(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post('/register', (req, res, next) => {
	if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.body.device_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "device_id" }
        });
    if (!req.body.device_ip)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "device_ip" }
        });
    if (!req.body.device_name)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "device_name" }
        });
    if (!req.body.device_type)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "device_type" }
        });
    if (!req.body.pin)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "pin" }
		});
	if (req.body.device_type == '0' && req.body.pin != '1') return callback({
			code: 'INVALID_REQUEST',
			message: 'Invalid total pin!'
		})
    if (!req.auth) req.auth = { user_id: req.body.user_id };
	delete req.body.user_id;
	
	deviceController.register(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/activate', (req, res, next) => {
	if (!req.auth && !req.body.user_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'user_id' }
	})
	if (!req.body.device_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'device_id' }
	})
	if (!req.body.active_status) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'active_status' }
	})
	if (!req.body.type) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'type' }
	})
	if (req.body.type == 1 && !req.body.pin) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		message: 'Type 1 must include pin!',
		data: { missing_parameter: 'pin' }
	})
	if (!req.auth) req.auth = { 'user_id': req.body.user_id }

	deviceController.activate(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/registerkeyword', (req, res, next) => {
	deviceController.registerkeyword(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/getid', (req, res, next) => {
	deviceController.getid(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/devicedetail', (req, res, next) => {
	deviceController.devicedetail(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/pindetail', (req, res, next) => {
	deviceController.pindetail(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/updatename', (req, res, next) => {
	deviceController.updatename(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/devicehistory', (req, res, next) => {
	if (!req.body.user_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'user_id' }
	})
	// if (!req.body.date_from) return req.APP.output.print(req, res, {
	// 	code: 'MISSING_KEY',
	// 	data: { missing_parameter: 'date_from' }
	// })
	// if (!req.body.date_to) return req.APP.output.print(req, res, {
	// 	code: 'MISSING_KEY',
	// 	data: { missing_parameter: 'date_to' }
	// })

	deviceController.devicehistory(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

/**
 * Route Command
 */
router.post('/command', (req, res, next) => {
	if (!req.auth && !req.body.user_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'user_id' }
	})
	if (!req.body.device_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'device_id' }
	})
	if (!req.body.switch) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'switch' }
	})
	if (!req.auth) req.auth = { 'user_id': req.body.user_id }

	deviceController.command(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/status', (req, res, next) => {
	deviceController.status(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/sensordata', (req, res, next) => {
	if (!req.body.user_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'user_id' }
	})
	if (!req.body.device_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'device_id' }
	})
	if (!req.body.device_type) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'device_type' }
	})
	if (!req.body.pin) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'pin' }
	})
	if (!req.body.sensor_status) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'sensor_status' }
	})
	if (!req.body.switch) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'switch' }
	})
	if (!req.body.ampere) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'ampere' }
	})
	if (!req.body.wattage) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'wattage' }
	})
	if (!req.body.date) req.body.date = vascommkit.time.now()
	
	deviceController.sensordata(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/sensordata_v2', (req, res, next) => {
	deviceController.sensordata_v2(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

router.post('/runtimereportperday', (req, res, next) => {
	deviceController.runtimereportperday(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/runtimereportperdev', (req, res, next) => {
	deviceController.runtimereportperdev(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/runtimereportdaily', (req, res, next) => {
	deviceController.runtimereportdaily(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post("/runtimereport", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.body.date_from)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "date_from" }
		});
	if (!valid.date(req.body.date_from))
        return req.APP.output.print(req, res, {
            code: "INVALID_REQUEST",
            data: { invalid_parameter: "date_from" }
        });
    if (!req.body.date_to)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "date_to" }
		});
	if (!valid.date(req.body.date_to))
        return req.APP.output.print(req, res, {
            code: "INVALID_REQUEST",
            data: { invalid_parameter: "date_to" }
        });
    if (!req.auth) req.auth = { user_id: req.body.user_id };

    deviceController.runtimereport(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/runtimereport/weekly", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
		});
		
    if (!req.auth) req.auth = { user_id: req.body.user_id };

    req.body.range = "WEEKLY";

    deviceController.runtimereport(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post('/totalruntime', (req, res, next) => {
	if (!req.auth && !req.body.user_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'user_id' }
	})
	if (!req.body.date_from) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'date_from' }
	})
	if (!req.body.date_to) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'date_to' }
	})
	if (!req.auth) req.auth = { 'user_id': req.body.user_id }

	deviceController.totalruntime(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post("/totalruntime/daily", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });

    if (!req.auth) req.auth = { user_id: req.body.user_id };

    req.body.range = "DAILY";

    deviceController.totalruntime_range(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/totalruntime/weekly", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.auth) req.auth = { user_id: req.body.user_id };

    req.body.range = "WEEKLY";

    deviceController.totalruntime_range(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/totalruntime/range", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.body.date_from)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "date_from" }
        });
    if (!req.body.date_to)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "date_to" }
        });

    if (!req.auth) req.auth = { user_id: req.body.user_id };

    deviceController.totalruntime_range(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post('/testing', (req, res, next) => {
	deviceController.testing(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/commandpanel', (req, res, next) => {
	deviceController.commandpanel(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/ipupdate', (req, res, next) => {
	deviceController.ipupdate(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/check', (req, res, next) => {
	if (!req.body.user_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'user_id' }
	})
	if (!req.body.device_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'device_id' }
	})
	if (!req.body.device_ip) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'device_ip' }
	})

	deviceController.check(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/updateusertdl', (req, res, next) => {
	deviceController.updateusertdl(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/getpagingdevice', (req, res, next) => {
	deviceController.getpagingdevice(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/getpaginghistory', (req, res, next) => {
	deviceController.getpaginghistory(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

/* Route Device Timer */
router.post('/timer/set', (req, res, next) => {
	deviceController.settimer(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/timer/switch', (req, res, next) => {
	deviceController.switchtimer(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

router.post('/timer/remove', (req, res, next) => {
	deviceController.removetimer(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
});

/* Route Reset Device */
router.post('/reset', (req, res, next) => {
	if (!req.body.user_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'user_id' }
	})
	if (!req.body.device_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'device_id' }
	})

	deviceController.reset(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

/* Route Delete Device */
router.post('/delete', (req, res, next) => {
	if (!req.body.user_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'user_id' }
	})
	if (!req.body.device_id) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'device_id' }
	})

	deviceController.delete(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

/* Route Generate Device ID */
router.post('/generate_id', (req, res, next) => {
	if (req.get('session-key') != 'apps') return req.APP.output.print(req, res, {
		code: 'INVALID_HEADERS',
		message: 'Only Apps allowed!'
	})
	
	let randomInt = Math.floor(Math.random() * 1000) + Math.floor(Math.random() * 100) + Math.floor(Math.random() * 10),
		generated = `SitamotoDevice-${process.env.HW_VER}_${req.auth.user_id}-${randomInt}` // FORMAT : SitamotoDevice-HWversion_UserId-RandomInteger

	return req.APP.output.print(req, res, {
		code: 'OK',
		data: { device_id: generated }
	});
})

/**
 * @title ROUTE FIRMWARE
 * @desc Below route handle Firmware Upgrade
 * 
 * @note Research use only, will develop soon
 */

/* Route Upgrade Firmware */
router.post("/firmware/upgrade", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.body.device_id) {
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "device_id" }
        });
    }
    if (!req.auth) req.auth = { user_id: req.body.user_id };
    delete req.body.user_id;

    deviceController.upgradeFirmware(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

/* Route Add Share User */
router.post('/addshareuser', (req, res, next) => {
	deviceController.addshareuser(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
})

/* Route Delete Share User */
router.post('/deleteshareuser', (req, res, next) => {
	deviceController.deleteshareuser(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
})

/* Route Cek Username */
router.post('/cekusername', (req, res, next) => {
	deviceController.cekusername(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
})

/* Route Get Share User */
router.post('/getshareduser', (req, res, next) => {
	deviceController.getshareduser(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
})

/* Route Update Status Share User */
router.post('/updatestatusshare', (req, res, next) => {
	deviceController.updatestatusshare(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		
		return req.APP.output.print(req, res, result);
	});
})

module.exports = router;
