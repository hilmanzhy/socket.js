"use strict";

module.exports = function (sequelize, Sequelize) {
	var device = sequelize.define('device', {

		device_id: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		user_id: {
			type: Sequelize.STRING,
			allowNull: false
		},
		device_ip: {
			type: Sequelize.STRING,
			allowNull: false
		},
		device_name: {
			type: Sequelize.STRING,
			allowNull: false
		},
		device_status: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		install_date: {
			type: Sequelize.DATE,
			allowNull: false
		},
		active_date: {
			type: Sequelize.DATE,
			allowNull: true
		},
		switch: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		device_type: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		number_of_pin: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		timer_on: {
			type: Sequelize.TIME,
			allowNull: true
		},
		timer_off: {
			type: Sequelize.TIME,
			allowNull: true
		},
		timer_status: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		lumensensor_on: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		lumensensor_off: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		lumensensor_status: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		is_connected: {
			type: Sequelize.INTEGER,
			allowNull: true
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

  device.associate = function (models) {};

  return device;
};