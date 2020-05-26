const User = APP => APP.models.mysql.user,
    async = require("async"),
    moment = require("moment");

exports.getSetting = function(APP, req, callback) {
    let options = {
        where: { user_id: req.auth.user_id },
        attributes: [
            "notif_token_alert",
            "notif_device_disconnected",
            "notif_sensor_status_update",
            "notif_device_connected",
            "notif_email_login",
            "notif_tax_update",
            "notif_update_token"
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

exports.setSetting = (APP, req, callback) => {
    let values = {},
        options = {
            where: { user_id: req.auth.user_id },
            attributes: [
                "notif_token_alert",
                "notif_device_disconnected",
                "notif_sensor_status_update",
                "notif_device_connected",
                "notif_email_login",
                "notif_tax_update",
                "notif_update_token"
            ]
        };

    User(APP)
        .findOne(options)
        .then(resGet => {
            // CHECK USER LEVEL
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

            if (req.body.notif_update_token && req.body.notif_update_token != resGet.notif_update_token)
                APP.roles.can(req, "notif_update_token", (err, permission) => {
                    if (err) return callback(err);
                    if (permission.granted) values.notif_update_token = req.body.notif_update_token;
                    else throw new Error("FORBIDDEN");
                });
            // END CHECK USER LEVEL

            return User(APP).update(values, options);
        })
        .then(res => {
            this.getSetting(APP, req, (err, resGet) => {
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

exports.get = (APP, req, callback) => {
    let { limit, skip } = req.body,
        queryOptions = { user_id: req.auth.user_id };

    limit = limit ? parseInt(limit) : 10;
    skip = skip ? parseInt(skip) : 0;

<<<<<<< HEAD
    async.parallel([
        function getDataNotif(callback) {
            APP.models.mongo.notif
                .find(queryOptions)
                .limit(limit)
                .skip(skip)
                .sort({ date: -1, time: -1 })
                .lean()
                .exec((err, notif) => {
                    if (err) return callback(err);

                    callback(null, notif);
=======
    APP.models.mongo.notif
        .find(queryOptions)
        .limit(limit)
        .skip(skip)
        .sort({ date: -1, time: -1 })
        .lean()
        .exec((err, notif) => {
            console.log(notif);
            
            if (err)
                return callback({
                    code: "ERR_DATABASE",
                    data: err.message
>>>>>>> brian_dev
                });

            return;
        },

        function getCountNotif(callback) {
            APP.models.mongo.notif
                .count(queryOptions)
                .lean()
                .exec((err, count) => {
                    if (err) return callback(err);

                    callback(null, {
                        limit: limit,
                        skip: skip,
                        total: count,
                    });
                })

            return;
        }
    ], (err, res) => {
        if (err) callback({
            code: "ERR_DATABASE",
            data: err.message
        })

        res[1].result = res[0]

        if (res) callback({
            code: res[0] && res[0].length > 0 ? "FOUND" : "NOT_FOUND",
            data: res[1]
        })
    })
};

exports.set = (APP, req, callback) => {
    let { id, read_status } = req.body,
        { user_id } = req.auth,
        update = {},
        condition = {
            _id: id,
            user_id,
        };

    switch (req.type) {
        case "SET_STATUS":
            update = { read_status };

            break;
    }

    APP.models.mongo.notif
        .findOneAndUpdate(condition, update)
        .exec((err, doc) => {
            if (err)
                return callback({
                    code: "ERR_DATABASE",
                    data: err.message,
                });
            if (!doc) return callback({ code: "NOT_FOUND" });

            callback(null, {
                code: "OK",
                message: "Status updated",
            });

            return;
        });
};