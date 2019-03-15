"use strict";

module.exports = function (sequelize, Sequelize) {
	var device_group = sequelize.define('device_group', {
		id: { type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true },
		id_akun: { type: Sequelize.STRING, allowNull: false},
		name: { type: Sequelize.STRING, allowNull: false},
		description: { type: Sequelize.STRING, allowNull: true},
		tdl: { type: Sequelize.INTEGER, allowNull: true}
  }, {});

  device_group.associate = function (models) {};

  return device_group;
};