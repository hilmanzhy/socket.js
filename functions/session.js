const async = require('async')
var randomstring = require("randomstring")

exports.put = function (APP, req, callback) {
    if(!req.headers['session-key']) return callback({ code: 'INVALID_HEADERS' })

    const Session = APP.models.mongo.session
    let { user_id, username, user_level } = req.body;

    let queryOptions = {
            user_id: user_id,
            username: username,
            session_key: req.headers["session-key"]
        },
        queryValue = { user_level: user_level };

    if (!req.auth) queryValue.session_id = randomstring.generate(22)

    Session.updateOne(queryOptions, queryValue, { upsert: true }, function(err, result) {
        if (err) {
            return callback({
                code: "ERR_DATABASE",
                data: JSON.stringify(err)
            });
        }

        callback(null, {
            code: "00",
            data: queryValue
        });
    });
}

exports.check = function (APP, req, callback) {
    if(!req.headers['session-key'] || !req.headers['session-id']) return callback({ code: 'INVALID_HEADERS' })

    var params = {
        session_id : req.headers['session-id'],
        session_key: req.headers['session-key']
    }

    APP.models.mongo.session.findOne(params).then((result) => {
        if (result) {
            callback(null, result)
        } else {
            callback({
                code: 'UNAUTHORIZED'
            })
        }
    }).catch((err) => {
        callback({
            code: 'ERR_DATABASE',
            data: JSON.stringify(err)
        })
    });
}

exports.delete = function (APP, req, callback) {
    if(!req.headers['session-key']) return callback({ code: 'INVALID_HEADERS' })

    var params = {
        session_id : req.headers['session-id'],
        session_key: req.headers['session-key']
    }

    APP.models.mongo.session.deleteOne(params).then((result) => {
        if (result) {
            return callback(null, result)
        } else {
            return callback({
                code: 'UNAUTHORIZED'
            })
        }
    }).catch((err) => {
        return callback({
            code: 'ERR_DATABASE',
            data: JSON.stringify(err)
        })
    });
}