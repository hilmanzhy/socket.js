"use strict";

module.exports = function (mongo) {
    if (mongo.models.deviceSession) return mongo.models.Session;

    const ModelSchema = mongo.Schema({
        device_id: String,
        session_id: String
    }, {
        timestamps: true
    });

    return mongo.model('deviceSession', ModelSchema);
};