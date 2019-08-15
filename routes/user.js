const express = require('express')
const router = express.Router()

// Controller
const userController = require('../controllers/userController.js')

router.post('/get', (req, res, next) => {
	userController.get(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err)

		return req.APP.output.print(req, res, result)
	});
})

router.post('/update', (req, res, next) => {
	userController.update(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		return req.APP.output.print(req, res, result);
	});
});

router.post('/pricing', (req, res, next) => {
	userController.pricing(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err)

		return req.APP.output.print(req, res, result)
	});
})

module.exports = router;