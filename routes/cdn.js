const express = require('express');
const router = express.Router();
// Controller
const cdnController = require('../controllers/cdnController.js');

router.post('/upload', ( req, res, next ) => {
	cdnController.uploadCDN( req.APP, req, ( err, result ) => {
		if ( err ) return req.APP.output.print( req, res, err );

		return req.APP.output.print( req, res, result );
	});
});

module.exports = router;

