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
		firmware_id: {
			type: Sequelize.STRING,
			defaultValue: 0
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
		is_connected: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		is_deleted: {
			type: Sequelize.BOOLEAN,
			allowNull: true
		},
		icon_id: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		mac_address: {
			type: Sequelize.STRING,
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