"use strict";

module.exports = function (mongo) {
	if (mongo.models.LogSocket) return mongo.models.LogSocket;

    const ModelSchema = mongo.Schema({
        event: String,
        request: {},
        response: {},
        date: Date,
        time: String
    });

    return mongo.model('LogSocket', ModelSchema);
};