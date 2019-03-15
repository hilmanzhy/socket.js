"use strict";

module.exports = function (mongo) {
	if (mongo.models.Test) return mongo.models.Test;

  const ModelSchema = mongo.Schema({
	  name: String,
	  value: String
	});

	return mongo.model('Test', ModelSchema);
};