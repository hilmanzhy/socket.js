"use strict";

module.exports = function (sequelize, Sequelize) {
	var device_pin = sequelize.define('device_pin', {

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
			allowNull: false,
			defaultValue: Sequelize.NOW
		},
		active_date: {
			type: Sequelize.DATE,
			allowNull: true
		},
		switch: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		pin: {
			type: Sequelize.INTEGER,
			allowNull: false
        },
        group_id: {
			type: Sequelize.INTEGER,
			allowNull: false
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
		sensor_status: {
			type: Sequelize.INTEGER,
			allowNull: true
		}
  }, {});

  device_pin.associate = function (models) {};

  return device_pin;
};