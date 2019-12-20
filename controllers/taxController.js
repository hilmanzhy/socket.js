var query = {};

exports.get = function(APP, req, cb) {
    const Tax = APP.models.mysql.city_tax;

    query.attributes = ["id", "city"];

    Tax.findAll(query)
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
