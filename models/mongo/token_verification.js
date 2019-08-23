module.exports = function (mongo) {
    if (mongo.models.TokenVerification) return mongo.models.TokenVerification;

    const ModelSchema = mongo.Schema({
        user_id: String,
        token: String,
        date: {
            type: Date,
            default: Date.now
        },
    });

    return mongo.model('TokenVerification', ModelSchema);
};