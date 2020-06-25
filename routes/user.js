const express = require("express");
const router = express.Router();

// Controller
const userController = require("../controllers/userController.js");

router.post("/get", (req, res, next) => {
    userController.get(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/update", (req, res, next) => {
    userController.update(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);
        return req.APP.output.print(req, res, result);
    });
});

router.post("/pricing", (req, res, next) => {
    userController.pricing(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

/**
 * User Token
 */
router.post("/token/update", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.body.token)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "token" }
        });
    if (!req.body.type)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "type" }
        });
    if (!req.auth) req.auth = { user_id: req.body.user_id };

    userController.tokenUpdate(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/token/alert", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.body.switch)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "switch" }
        });
    if (!req.auth) req.auth = { user_id: req.body.user_id };

    userController.tokenAlert(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/token/history", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.auth) req.auth = { user_id: req.body.user_id };

    userController.tokenHistory(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

module.exports = router;
