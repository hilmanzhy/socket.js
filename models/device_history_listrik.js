"use strict";

module.exports = function (sequelize, Sequelize) {
	var device_history_listrik = sequelize.define('device_history_listrik', {
		id: { type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true },
		id_device: { type: Sequelize.STRING, allowNull: false},
		id_akun: { type: Sequelize.STRING, allowNull: false},
		ip_device: { type: Sequelize.STRING, allowNull: false},
		id_pin: { type: Sequelize.STRING, allowNull: true},
		saklar: { type: Sequelize.BOOLEAN, allowNull: false},
		tipe_device: { type: Sequelize.BOOLEAN, allowNull: false},
		nama_device: { type: Sequelize.STRING, allowNull: false},
		tanggal: { type: Sequelize.DATE, allowNull: false}
  }, {});

  device_history_listrik.associate = function (models) {};

  return device_history_listrik;
};