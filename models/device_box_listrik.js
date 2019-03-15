"use strict";

module.exports = function (sequelize, Sequelize) {
	var device_box_listrik = sequelize.define('device_box_listrik', {
		id_device: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		id_akun: {
			type: Sequelize.STRING,
			allowNull: false
		},
		ip_device: {
			type: Sequelize.STRING,
			allowNull: false
		},
		nama_device: {
			type: Sequelize.STRING,
			allowNull: false
		},
		status_device: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		tanggal_install: {
			type: Sequelize.DATE,
			allowNull: false
		},
		tanggal_aktif: {
			type: Sequelize.DATE,
			allowNull: true
		},
		saklar: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		tipe_device: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		jml_pin: {
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
		health_status: {
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

  device_box_listrik.associate = function (models) {};

  return device_box_listrik;
};