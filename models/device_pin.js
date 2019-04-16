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
        }
  }, {});

  device_pin.associate = function (models) {};

  return device_pin;
};