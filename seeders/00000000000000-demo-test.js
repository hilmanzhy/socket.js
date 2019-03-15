"use strict";

const uuidv4 = require('uuid/v4');
const len = 10;
var data = [];
var i = 0;

for ( ; i < len; i++) {
  data[i] = new Object;
  data[i].id = uuidv4();
  data[i].name = 'test' + i;
  data[i].value = 'value' + i;
};

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('test', data, {});
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('test', null, {});
  }
};
