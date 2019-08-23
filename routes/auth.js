const express = require('express')
const router = express.Router()
// Controller
const authController = require('../controllers/authController.js')

router.post('/login', (req, res, next) => {
	authController.login(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err)

		return req.APP.output.print(req, res, result)
	});
});

router.post('/register', (req, res, next) => {
	authController.register(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err)

		return req.APP.output.print(req, res, result)
	});
});

router.get('/verify', (req, res, next) => {
	authController.verifyemail(req.APP, req, (err, result) => {
		if (result && result.code == 'OK') {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end('VERIFICATION SUCCESS!');
		} else if (result) {
			console.log(result)

			res.writeHead(500, {'Content-Type': 'text/html'});
			res.end('VERIFICATION FAILED! PLEASE CONTACT OUR TEAM.');
		} else {
			console.log(err)
			
			res.writeHead(500, {'Content-Type': 'text/html'});
			res.end('VERIFICATION FAILED! PLEASE CONTACT OUR TEAM.');
		}
		
	})
});

router.post('/changepassword', (req, res, next) => {
	authController.changepassword(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

router.post('/updatekey', (req, res, next) => {
	console.log("updatekey")
	authController.updatekey(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);
		// console.log(result)
		// res.send(result)
		return req.APP.output.print(req, res, result);
	});
});

router.post('/checkuser', (req, res, next) => {
	authController.checkuser(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err)

		return req.APP.output.print(req, res, result)
	});
})

module.exports = router;