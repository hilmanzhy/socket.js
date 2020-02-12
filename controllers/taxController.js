const async = require("async");
const Tax = APP => {
    return APP.models.mysql.city_tax;
};
const User = APP => {
    return APP.models.mysql.user;
};
const request = APP => {
    return APP.request;
};

var query = {},
    output = {};

exports.get = function(APP, req, cb) {
    query.attributes = ["id", "city"];

    Tax(APP)
        .findAll(query)
        .then(result => {
            cb(null, {
                code: result && result.length > 0 ? "FOUND" : "NOT_FOUND",
                data: result
            });
        })
        .catch(err => {
            cb(null, {
                code: "ERR_DATABASE",
                data: err.message
            });
        });
};

exports.create = function(APP, req, cb) {
    query.options = {
        where: { city: req.body.city },
        defaults: {
            city: req.body.city,
            rumah_tangga: req.body.tax_rt ? parseFloat(req.body.tax_rt) : null,
            sosial: req.body.tax_sosial
                ? parseFloat(req.body.tax_sosial)
                : null,
            bisnis: req.body.tax_bisnis
                ? parseFloat(req.body.tax_bisnis)
                : null,
            publik: req.body.tax_publik
                ? parseFloat(req.body.tax_publik)
                : null,
            industri: req.body.tax_industri
                ? parseFloat(req.body.tax_industri)
                : null
        }
    };

    Tax(APP)
        .findOrCreate(query.options)
        .then(result => {
            if (!result[1]) throw new Error("ERR_DUPLICATE"); // If data already exist!

            cb(null, {
                code: "OK",
                message: `City tax ${req.body.city} successfully created`
            });
        })
        .catch(err => {
            switch (err.message) {
                case "ERR_DUPLICATE":
                    output.code = "ERR_DUPLICATE";
                    output.message = `City tax ${req.body.city} already exist!`;

                    break;

                default:
                    output.code = "ERR_DATABASE";
                    output.message = err.message;
            }

            cb(output);
        });
};

exports.update = function(APP, req, cb) {
    query.values = {};
    query.options = {
        where: { city: req.body.city }
    };

    let {
        options: { where }
    } = query;
    let tax;

    if (req.body.tax_rt)
        query.values.rumah_tangga = parseFloat(req.body.tax_rt);
    if (req.body.tax_sosial)
        query.values.sosial = parseFloat(req.body.tax_sosial);
    if (req.body.tax_bisnis)
        query.values.bisnis = parseFloat(req.body.tax_bisnis);
    if (req.body.tax_publik)
        query.values.publik = parseFloat(req.body.tax_publik);
    if (req.body.tax_industri)
        query.values.industri = parseFloat(req.body.tax_industri);

    Tax(APP)
        .update(query.values, query.options)
        .then(resultUpdate => {
            if (resultUpdate[0] > 0) {
                return Tax(APP).findOne(query.options);
            }

            return;
        })
        .then(resultTax => {
            if (resultTax) {
                tax = resultTax;

                return User(APP).findAll({
                    attributes: ["name", "email", "device_key"],
                    where: {
                        tax_id: tax.id
                    }
                });
            }

            return;
        })
        .then(resultUser => {
            output.code = "OK";

            if (resultUser) {
                resultUser.map(user => {
                    if (user.device_key) {
                        let notif = {
                            notif: {
                                title: "Road Elecrticity Tax Update",
                                body: `Hello ${user.name}, there is an update in the Road Electricity Tax in ${where.city}, please check your email.`,
                                tag: user.name
                            },
                            data: {
                                device_key: user.device_key
                            }
                        };

                        request(APP).sendNotif(notif, (err, res) => {
                            if (err) console.error(err);
                            if (res)
                                console.log(
                                    `/ SENDING PUSH NOTIFICATION to ${user.name}/`
                                );
                        });
                    }

                    if (user.email) {
                        let payload = {
                            to      : user.email,
                            subject : `Road Elecrticity Tax Update`,
                            html    : {
                                file    : 'tax.html',
                                data    : {
                                    name            : user.name,
                                    city            : where.city,
                                    rumah_tangga    : tax.rumah_tangga,
                                    sosial          : tax.sosial,
                                    bisnis          : tax.bisnis,
                                    publik          : tax.publik,
                                    industri        : tax.industri,
                                    cdn_url : `${ process.env.APP_URL }/cdn`,
                                }
                            }
                        }

                        request(APP).sendEmail(payload, (err, res) => {
                            if (err) console.error(err);
                            if (res)
                                console.log(
                                    `/ SENDING EMAIL to ${user.email}/`
                                );
                        });
                    }
                });

                output.message = "City tax successfully updated";
            } else {
                output.message = "City tax not updated";
            }

            cb(null, output);
        })
        .catch(err => {
            cb({
                code: "GENERAL_ERR",
                message: err.message
            });
        });
};

exports.delete = function(APP, req, cb) {
    query.options = {
        where: { city: req.body.city }
    };

    Tax(APP)
        .findOne(query.options)
        .then(resultTax => {
            if (!resultTax) throw new Error("NOT_FOUND"); // If data not found!

            return Tax(APP).destroy(query.options);
        })
        .then(result => {
            cb(null, {
                code: "OK",
                data: "City tax successfully deleted"
            });
        })
        .catch(err => {
            switch (err.message) {
                case "NOT_FOUND":
                    output.code = "NOT_FOUND";
                    output.message = "City tax not found!";

                    break;
                default:
                    output.code = "ERR_DATABASE";
                    output.message = e.message;

                    break;
            }

            cb(output);
        });
};
