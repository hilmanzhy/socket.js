"use strict";

module.exports = function (sequelize, Sequelize) {
	var device_detail_listrik = sequelize.define('device_detail_listrik', {
		id: { type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true },
		id_device: { type: Sequelize.STRING, allowNull: false},
		keyword: { type: Sequelize.STRING, allowNull: false},
		id_pin: { type: Sequelize.STRING, allowNull: false},
		tanggal: { type: Sequelize.DATE, allowNull: false}
  }, {});

  device_detail_listrik.associate = function (models) {};

  return device_detail_listrik;
};