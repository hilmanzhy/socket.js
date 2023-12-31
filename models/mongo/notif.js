"use strict";

module.exports = function (mongo) {
	if (mongo.models.Notification) return mongo.models.Notification;

    const ModelSchema = mongo.Schema({
        user_id: String,
        notification: {
            title: String,
            body: String
        },
        data: Object,
        read_status: {
            type: Number,
            default: 0
        },
        date: String,
        time: String
    });

	return mongo.model('Notification', ModelSchema);
};