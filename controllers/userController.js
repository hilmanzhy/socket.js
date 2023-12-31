const async = require("async");
const { parse } = require("mustache");
roles = require("../functions/roles.js");
session = require("../functions/session.js");
validation = require("../functions/validation.js");

let query = {};
output = {};

exports.get = function(APP, req, callback) {

    let User = APP.models.mysql.user,
        queryOptions = {
            include: "user_level",
            where: { username: req.auth.username }
        };

    async.waterfall(
        [
            function(callback) {
                session.check(APP, req, (err, result) => {
                    if (err) return callback({ code: err.code });

                    callback(null, result);
                });
            },

            function(data, callback) {
                User.findOne(queryOptions)
                    .then(result => callback(null, result.toJSON()))
                    .catch(err => {
                        console.log(err);
                        callback({
                            code: "ERR_DATABASE",
                            data: err.message
                        });
                    });
            },

            function getRole(data, callback) {
                let mapFeature = roles.feature(req, data.user_level.level_previledge);

                Promise.all(mapFeature)
                    .then(result => {
                        data.user_level = result.filter(Boolean);

                        callback(null, data);
                    })
                    .catch(err => {
                        callback({
                            code: "GENERAL_ERR",
                            data: JSON.stringify(err)
                        });
                    });
            },

            function putSession(data, callback) {
                req.body = data;

                session.put(APP, req, (err, res) => {
                    if (err) {
                        return callback({
                            code: err.code,
                            message: err.message
                        });
                    }

                    let output = {
                        code: data ? "FOUND" : "NOT_FOUND",
                        data: data
                    };

                    callback(null, output);
                });
            }
        ],
        function(err, result) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, result);
            }
        }
    );
};

exports.update = function(APP, req, callback) {
    const User = APP.models.mysql.user;

    async.waterfall(
        [
            function validator(callback) {
                if (validation.name(req.body.name) != true)
                    return callback(validation.name(req.body.name));
                if (validation.email(req.body.email) != true)
                    return callback(validation.email(req.body.email));
                if (validation.phone(req.body.phone) != true)
                    return callback(validation.phone(req.body.phone));
                if (!req.body.tdl_id)
                    return callback({ code: "MISSING_KEY", data: "tdl_id" });

                session.check(APP, req, (err, result) => {
                    if (err) return callback({ code: err.code });

                    callback(null, result);
                });
            },

            function create(data, callback) {
                query.value = req.body;
                query.options = {
                    where: {
                        username: data.username
                    }
                };

                User.update(query.value, query.options)
                    .then(resUpdate => {
                        console.log(`========== RESULT ==========`);
                        console.log(resUpdate);

                        callback(null, {
                            code: "OK",
                            message: "Update User Success"
                        });
                    })
                    .catch(e => {
                        callback({
                            code: "ERR_DATABASE",
                            message: JSON.stringify(e)
                        });
                    });
            }
        ],
        function(err, result) {
            if (err) {
                return callback(err);
            }
            return callback(null, result);
        }
    );
};

exports.pricing = function(APP, req, callback) {
    let Pricing = APP.models.mysql.pricing;
    params = req.body;

    console.log(params);

    async.waterfall(
        [
            function(callback) {
                if (params.meter_type && params.allocation) {
                    query.where = {
                        meter_type: params.meter_type,
                        allocation: params.allocation
                    };
                } else if (params.tdl_id) {
                    query.where = { id: params.tdl_id };
                } else {
                    return callback({ code: "MISSING_KEY" });
                }

                callback(null, query);
            },
            function(query, callback) {
                if (query.where.id) {
                    Pricing.findOne(query)
                        .then(dataPricing => {
                            callback(null, {
                                code: dataPricing ? "FOUND" : "NOT_FOUND",
                                data: dataPricing
                            });
                        })
                        .catch(e => {
                            callback({
                                code: "ERR_DATABASE",
                                data: JSON.stringify(e)
                            });
                        });
                } else {
                    Pricing.findAll(query)
                        .then(dataPricing => {
                            callback(null, {
                                code:
                                    dataPricing && dataPricing.length > 0
                                        ? "FOUND"
                                        : "NOT_FOUND",
                                data: dataPricing
                            });
                        })
                        .catch(e => {
                            callback({
                                code: "ERR_DATABASE",
                                data: JSON.stringify(e)
                            });
                        });
                }
            }
        ],
        (err, result) => {
            if (err) return callback(err);

            return callback(null, result);
        }
    );
};

exports.tokenUpdate = function(APP, req, cb) {
    async.waterfall(
        [
            function generatingQuery(cb) {
                query = {
                    sp:
                        "CALL sitadev_iot_2.insert_token (:user_id, :token_rph_topup, :token_kwh_topup)",
                    values: {},
                    options: {
                        where: { user_id: req.auth.user_id },
                        include: "electricity_pricing"
                    }
                };

                cb(null, query, req);
            },

            function processingData(query, req, cb) {
                let { values } = query,
                    { options } = query,
                    token = {},
                    user,
                    power,
                    max_token,
                    pricing;

                APP.models.mysql.user
                    .findOne(query.options)
                    .then(result => {
                        if (!result) throw new Error("USER_NULL");
                        if (!result.tdl_id) throw new Error("TDL_NULL");
                        if (result.electricity_pricing.meter_type != "2")
                            throw new Error("PRA_ONLY");

                        user = result;
                        pricing = user.electricity_pricing;

                        token.topup_balance = 
                            req.body.type == 'rph' ? `Rp. ${req.body.token}` : 
                            req.body.type == 'kwh' ? `${req.body.token} kWh` : ''

                        return APP.db.sequelize.query(query.sp, {
                            replacements: {
                                user_id: req.auth.user_id,
                                token_rph_topup: req.body.type == 'rph' ? req.body.token : null,
                                token_kwh_topup: req.body.type == 'kwh' ? req.body.token : null
                            },
                            type: APP.db.sequelize.QueryTypes.RAW
                        });
                    })
                    .then(resUpdate => {       
                        token.kwh = resUpdate[0].token;
                                         
                        switch (resUpdate[0].message) {
                            case "0":
                                throw new Error("MAX_TOKEN");
                        
                            case "2":
                                throw new Error("TAX_UNAVAILABLE");

                            case "3":
                                throw new Error("MAX_TOKEN");

                        }

                        options.attributes = ["token", "notif_update_token"];
                        delete options.include;

                        return APP.models.mysql.user.findOne(query.options);
                    })
                    .then(resUser => {
                        token.total_balance = `${resUser.token} kWh`;

                        cb(null, token, user);
                    })
                    .catch(e => {
                        switch (e.message) {
                            case "USER_NULL":
                                output.code = "NOT_FOUND";
                                output.message = "User not found!";

                                break;

                            case "TDL_NULL":
                                output.code = "INVALID_REQUEST";
                                output.message = "TDL not selected!";

                                break;

                            case "PRA_ONLY":
                                output.code = "INVALID_REQUEST";
                                output.message = "Prabayar only!";

                                break;

                            case "MAX_TOKEN":
                                output.code = "INVALID_REQUEST";
                                output.message = "Max token reached!";

                                break;

                            case "TAX_UNAVAILABLE":
                                output.code = "INVALID_REQUEST";
                                output.message = "Sorry, you can't use this feature, city tax unavailable!";

                                break;

                            default:
                                output.code = "ERR_DATABASE";
                                output.message = e.message;

                                break;
                        }

                        cb(output);
                    });
            },

            function pushNotif(token, user, cb) {
                if (user.notif_update_token) {
                    let params = {
                        notif: {
                            title: "TopUp Token Success",
                            body:
                                `TopUp balance ${token.topup_balance}` +
                                "\n" +
                                `Total balance ${token.total_balance}`
                        },
                        data: {
                            user_id: user.user_id,
                            user_name: user.name,
                            device_key: user.device_key
                        }
                    };
    
                    APP.request.sendNotif(APP.models, params, (err, res) => {
                        if (err)
                            return cb({
                                code: "GENERAL_ERR",
                                message: err.message
                            });
    
                        console.log("PUSH NOTIFICATION!");

                    });
                }

                cb(null, {
                    code: "OK",
                    message: "Topup Token success",
                    data: token
                });
            }
        ],
        function(err, res) {
            if (err) return cb(err);

            return cb(null, res);
        }
    );
};

exports.tokenAlert = function(APP, req, cb) {
    query = {
        update: { notif_token_alert: req.body.switch },
        options: {
            where: { user_id: req.auth.user_id }
        }
    };

    APP.models.mysql.user
        .update(query.update, query.options)
        .then(result => {
            cb(null, {
                code: "OK",
                message: "Switch updated"
            });
        })
        .catch(err => {
            cb({
                code: "GENERAL_ERR",
                message: err.message
            });
        });
};

exports.tokenHistory = (APP, req, callback) => {
    let {history_token_update} = APP.models.mysql,
        totalkWh = 0,
        totalRupiah = 0;

    query = {
        options: {
            where: { user_id: req.auth.user_id },
            order: [['id', 'DESC']]
        }
    };
    async.waterfall(
        [
            function getData(callback) {
                history_token_update
                    .findAll(query.options)
                    .then(res => {
                        if (res.length == 0) return callback({code: 'NOT_FOUND'})

                        callback(null, res);
                    })
                    .catch(err => {
                        callback({
                            code: "ERR_DATABASE",
                            data: JSON.stringify(err)
                        })
                    })
            },

            function sumData(data, callback) {
                Promise.all(
                    data.map((x, i) => {
                        totalkWh += parseFloat(x.kwh);
                        totalRupiah += parseInt(x.rupiah);

                        return;
                    })
                )
                .then(() => {
                    callback(null, {
                        code: 'FOUND',
                        data: {
                            total: {
                                total_rupiah: totalRupiah,
                                total_kwh: totalkWh
                            },
                            rows: data
                        }
                    })
                })
                .catch(err => {
                    callback({
                        code: "ERR",
                        data: JSON.stringify(err)
                    })
                })
            }
        ],
        function(err, res) {
            if (err) return callback(err);

            return callback(null, res);
        }
    )
};
