"use strict";

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('test', {
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
    });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('test');
  }
};