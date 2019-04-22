"use strict";

module.exports = function (sequelize, Sequelize) {
	var device_box_sensor = sequelize.define('device_box_sensor', {
        id: { type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true },
		id_device: { type: Sequelize.STRING, allowNull: false},
		id_akun: { type: Sequelize.STRING, allowNull: false},
		device_ip: { type: Sequelize.STRING, allowNull: false},
        status_device: { type: Sequelize.BOOLEAN, allowNull: false},
        date_on: { type: Sequelize.DATE, allowNull: false},
        date_off: { type: Sequelize.DATE, allowNull: false},
        current_sensor: { type: Sequelize.DOUBLE, allowNull: false},
        watt: { type: Sequelize.DOUBLE, allowNull: false},
        is_proceed: { type: Sequelize.BOOLEAN, allowNull: false},
		
  }, {});

  device_box_sensor.associate = function (models) {};

  return device_box_sensor;
};