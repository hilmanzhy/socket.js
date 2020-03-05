const User = APP => APP.models.mysql.user,
    async = require("async");

exports.get = function(APP, req, callback) {
    let options = {
        where: { user_id: req.auth.user_id },
        attributes: [
            "notif_token_alert",
            "notif_device_disconnected",
            "notif_sensor_status_update",
            "notif_device_connected",
            "notif_email_login",
            "notif_tax_update"
        ]
    };

    User(APP)
        .findOne(options)
        .then(result =>
            callback(null, {
                code: "FOUND",
                data: result
            })
        )
        .catch(err => {
            callback({
                code: "ERR_DATABASE",
                message: err.message
            });
        });
};

exports.set = (APP, req, callback) => {
    let values = {},
        options = {
            where: { user_id: req.auth.user_id },
            attributes: [
                "notif_token_alert",
                "notif_device_disconnected",
                "notif_sensor_status_update",
                "notif_device_connected",
                "notif_email_login",
                "notif_tax_update"
            ]
        };

    User(APP)
        .findOne(options)
        .then(resGet => {
            if (
                req.body.notif_token_alert &&
                req.body.notif_token_alert != resGet.notif_token_alert
            )
                APP.roles.can(req, "notif_token_alert", (err, permission) => {
                    if (err) return callback(err);
                    if (permission.granted) values.notif_token_alert = req.body.notif_token_alert;
                    else throw new Error("FORBIDDEN");
                });

            if (
                req.body.notif_device_disconnected &&
                req.body.notif_device_disconnected != resGet.notif_device_disconnected
            )
                APP.roles.can(req, "notif_device_disconnected", (err, permission) => {
                    if (err) return callback(err);
                    if (permission.granted)
                        values.notif_device_disconnected = req.body.notif_device_disconnected;
                    else throw new Error("FORBIDDEN");
                });

            if (
                req.body.notif_sensor_status_update &&
                req.body.notif_sensor_status_update != resGet.notif_sensor_status_update
            )
                APP.roles.can(req, "notif_sensor_status_update", (err, permission) => {
                    if (err) return callback(err);
                    if (permission.granted)
                        values.notif_sensor_status_update = req.body.notif_sensor_status_update;
                    else throw new Error("FORBIDDEN");
                });

            if (
                req.body.notif_device_connected &&
                req.body.notif_device_connected != resGet.notif_device_connected
            )
                APP.roles.can(req, "notif_device_connected", (err, permission) => {
                    if (err) return callback(err);
                    if (permission.granted)
                        values.notif_device_connected = req.body.notif_device_connected;
                    else throw new Error("FORBIDDEN");
                });

            if (
                req.body.notif_email_login &&
                req.body.notif_email_login != resGet.notif_email_login
            )
                APP.roles.can(req, "notif_email_login", (err, permission) => {
                    if (err) return callback(err);
                    if (permission.granted) values.notif_email_login = req.body.notif_email_login;
                    else throw new Error("FORBIDDEN");
                });

            if (req.body.notif_tax_update && req.body.notif_tax_update != resGet.notif_tax_update)
                APP.roles.can(req, "notif_tax_update", (err, permission) => {
                    if (err) return callback(err);
                    if (permission.granted) values.notif_tax_update = req.body.notif_tax_update;
                    else throw new Error("FORBIDDEN");
                });

            return User(APP).update(values, options);
        })
        .then(res => {
            this.get(APP, req, (err, resGet) => {
                if (err) throw new Error(err);

                callback(null, {
                    code: "OK",
                    data: resGet.data,
                    message: res[0] > 0 ? "Notification updated" : "Notification not updated!"
                });
            });
        })
        .catch(err => {
            let errResponse;

            switch (err.message) {
                case "FORBIDDEN":
                    errResponse = {
                        code: "FORBIDDEN"
                    };

                    break;

                default:
                    errResponse = {
                        code: "ERR_DATABASE",
                        message: err.message
                    };

                    break;
            }

            callback(errResponse);
        });
};
