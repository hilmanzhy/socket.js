"use strict";

module.exports = function (mongo) {
	if (mongo.models.OTP) return mongo.models.OTP;

    const ModelSchema = mongo.Schema({
        email: String,
        otp: Number,
        date: Date,
    });

	return mongo.model('OTP', ModelSchema);
};