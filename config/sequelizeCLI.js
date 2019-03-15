"use strict";

const environment = require('../app.json').env;

require('env2')('.env.' + environment);

module.exports = {
  development: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_NAME,
    host: process.env.MYSQL_HOST,
    dialect: process.env.MYSQL_DIALECT
  },
  test: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_NAME,
    host: process.env.MYSQL_HOST,
    dialect: process.env.MYSQL_DIALECT
  },
  production: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_NAME,
    host: process.env.MYSQL_HOST,
    dialect: process.env.MYSQL_DIALECT
  }
};