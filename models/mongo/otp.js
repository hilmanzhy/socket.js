"use strict";

module.exports = function (mongo) {
	if (mongo.models.OTP) return mongo.models.OTP;

    const ModelSchema = mongo.Schema(
        {
            email: String,
            otp: Number,
            failed_attempt: Number,
            request_attempt: Number
        },
        { timestamps : true }
    );

	return mongo.model('OTP', ModelSchema);
};