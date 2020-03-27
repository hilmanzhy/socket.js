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
            default: Date.now,
            get: (date) => {
                return "0000-00-00 00:00:00";
            }
        },
    });

	return mongo.model('Notification', ModelSchema);
};