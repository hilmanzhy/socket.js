"use strict";

module.exports = function (mongo) {
	if (mongo.models.Notification) return mongo.models.Notification;

    const ModelSchema = mongo.Schema({
        user_id: String,
        notification: {
            title: String,
            body: String
        },
        date: {
            type: Date,
            default: Date.now
        },
    });

	return mongo.model('Notification', ModelSchema);
};