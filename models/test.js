"use strict";

module.exports = function (sequelize, Sequelize) {
  var Test = sequelize.define('test', {
    id: {
    	type: Sequelize.UUID,
    	primaryKey: true,
    	allowNull: false,
    	defaultValue: Sequelize.UUIDV4,
    	unique: true
    },
    name: {
    	type: Sequelize.STRING(45)
    },
    value: {
    	type: Sequelize.STRING(45)
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {});

  Test.associate = function (models) {};

  return Test;
};