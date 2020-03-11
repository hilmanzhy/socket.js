const express = require("express");
const router = express.Router();
const notifController = require("../controllers/notifController.js");

router.post("/get", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (!req.auth) req.auth = { user_id: req.body.user_id };
    delete req.body.user_id;

    notifController.get(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/set", (req, res, next) => {
    if (!req.auth && !req.body.user_id)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "user_id" }
        });
    if (
        !req.body.notif_token_alert &&
        !req.body.notif_device_disconnected &&
        !req.body.notif_device_connected &&
        !req.body.notif_sensor_status_update &&
        !req.body.notif_email_login &&
        !req.body.notif_tax_update
    )
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY"
        });
    if (!req.auth) req.auth = { user_id: req.body.user_id };
    delete req.body.user_id;

    notifController.set(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

module.exports = router;