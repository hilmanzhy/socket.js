"use strict";

module.exports = function (mongo) {
    if (mongo.models.Session) return mongo.models.Session;

    const ModelSchema = mongo.Schema({
        username: String,
        session_id: String,
        session_key: String,
        expired: String,
        expired_in: String,
        date: {
            type: Date,
            default: Date.now
        },
    });

    return mongo.model('Session', ModelSchema);
};