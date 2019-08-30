"use strict";
const moment = require('moment');

module.exports = function (sequelize, Sequelize) {
	var device_history = sequelize.define('device_history', {
		id: { type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true },
		device_id: { type: Sequelize.STRING, allowNull: false},
		user_id: { type: Sequelize.STRING, allowNull: false},
		device_ip: { type: Sequelize.STRING, allowNull: false},
		pin: { type: Sequelize.STRING, allowNull: true},
		switch: { type: Sequelize.BOOLEAN, allowNull: false},
		device_type: { type: Sequelize.BOOLEAN, allowNull: false},
		device_name: { type: Sequelize.STRING, allowNull: false},
		date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            get: function () {
                return moment(this.getDataValue('date')).format('DD-MM-YYYY HH:mm:ss')
            }
        },
		created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
  }, {});

  device_history.associate = function (models) {};

  return device_history;
};