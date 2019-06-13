"use strict";

module.exports = function (mongo) {
	if (mongo.models.Log) return mongo.models.Log;

  const ModelSchema = mongo.Schema({
  	endpoint: String,
	  request: {},
	  response: {},
	  status: String,
	  date: Date,
	  time: String
	});

	return mongo.model('Log', ModelSchema);
};