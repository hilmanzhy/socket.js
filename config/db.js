"use strict";

/* -------------------------------------------------------------------------------------------------------------------- */
/* ----------------------------------------------------- MONGO -------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------- */
const mongoose = require('mongoose');
const host = process.env.MONGO_HOST;
const name = process.env.MONGO_NAME;

mongoose.connect('mongodb://' + host + '/' + name, { useNewUrlParser: true });
mongoose.connection.on('error', console.error.bind(console, 'Database connection error!'));
// mongoose.connection.once('open', () => {
// 	console.log('MongoDB Connected');
// });

exports.mongo = mongoose;

/* -------------------------------------------------------------------------------------------------------------------- */
/* ----------------------------------------------------- MYSQL -------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------- */
const Sequelize = require('sequelize');
const mysqlPool = {
	min: Number(process.env.MYSQL_POOL_MIN),
	max: Number(process.env.MYSQL_POOL_MAX),
	idle: Number(process.env.MYSQL_POOL_IDLE),
	acquire: Number(process.env.MYSQL_POOL_ACQUIRE),
	evict: Number(process.env.MYSQL_POOL_EVICT),
	handleDisconnects: true
};
const define = {
	timestamps: false,
	freezeTableName: true
	// paranoid: true,
};
const mysqlDialect = process.env.MYSQL_DIALECT;
const mysqlDialectOptions = {
	useUTC: false,
	dateStrings: true,
	typeCast: true,
	// requestTimeout: Number(process.env.MYSQL_DIALECT_REQUEST_TIMEOUT)
};
var options = {
	host: process.env.MYSQL_HOST,
	port: process.env.MYSQL_PORT,
	timezone: '+07:00',
	dialect: mysqlDialect,
	// dialectOptions: mysqlDialectOptions,
	pool: mysqlPool,
	define: define,
	logging: true
};
const sequelize = new Sequelize(process.env.MYSQL_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASS, options);

exports.sequelize = sequelize;
exports.Sequelize = Sequelize;