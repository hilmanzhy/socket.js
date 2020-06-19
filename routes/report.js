const express = require('express');
const router = express.Router();
// Controller
const reportController = require('../controllers/reportController.js');

router.post('/reporthistory', ( req, res, next ) => {
    if (!req.body.month) return req.APP.output.print(req, res, {
		code: 'MISSING_KEY',
		data: { missing_parameter: 'month' }
    });
    
	reportController.reportHistory( req.APP, req, ( err, result ) => {
		if ( err ) return req.APP.output.print( req, res, err );

		return req.APP.output.print( req, res, result );
	});
});

router.post('/usage/change', (req, res, next) => {   
	reportController.changeUsageTarget(req.APP, req, (err, result) => {
		if ( err ) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

router.post('/usage/notif', (req, res, next) => {   
	reportController.setNotifUsageTarget(req.APP, req, (err, result) => {
		if ( err ) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

module.exports = router;
