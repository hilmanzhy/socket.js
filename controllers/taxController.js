const async = require("async");
const Tax = APP => {
    return APP.models.mysql.city_tax;
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
                data: e.message
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
                    output.code = "GENERAL_ERR";
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
        .findOne(query.options)
        .then(resultTax => {
            if (!resultTax) throw new Error("NOT_FOUND"); // If data not found!

            return Tax(APP).update(query.values, query.options);
        })
        .then(resultUpdate => {
            cb(null, {
                code: "OK",
                data: "City tax successfully updated"
            });
        })
        .catch(err => {
            switch (err.message) {
                case "NOT_FOUND":
                    output.code = "NOT_FOUND";
                    output.message = "City tax not found!";

                    break;

                default:
                    output.code = "GENERAL_ERR";
                    output.message = err.message;
            }

            cb(output);
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
                    output.code = "GENERAL_ERR";
                    output.message = e.message;

                    break;
            }

            cb(output);
        });
};
