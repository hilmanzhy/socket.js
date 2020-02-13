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

router.post('/logout', (req, res, next) => {
	authController.logout(req.APP, req, (err, result) => {
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

router.post("/verify", (req, res, next) => {
    if (!req.body.token)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "token" }
        });

    req.body.type = "VERIFY_TOKEN";

    authController.verify(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/verify/send", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.auth) req.auth = { user_id: req.body.user_id };

    req.body.type = "SEND_LINK";

    authController.verify(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post('/changepassword', (req, res, next) => {
	authController.changepassword(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

router.post('/forgotpassword', (req, res, next) => {
	authController.forgotpassword(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

router.post('/resetpassword', (req, res, next) => {
	authController.resetpassword(req.APP, req, (err, result) => {
		if (err) return req.APP.output.print(req, res, err);

		return req.APP.output.print(req, res, result);
	});
});

router.post('/checkotp', (req, res, next) => {
	authController.checkotp(req.APP, req, (err, result) => {
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