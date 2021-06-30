'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sender: {
        type: Sequelize.BIGINT
      },
      receiver: {
        type: Sequelize.BIGINT
      },
      amount: {
        type: Sequelize.DOUBLE,
        defaultValue:0
      },
      fee: {
        type: Sequelize.DOUBLE,
        defaultValue:0
      },
      type: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue:0
      },
      paid_at: {
        type: Sequelize.DATE
      },
      paid_amount: {
        type: Sequelize.DOUBLE,
        defaultValue:0
      },
      tr_id: {
        defaultValue:0,
        type: Sequelize.STRING,
      },
      trx_id: {
        defaultValue:0,
        type: Sequelize.STRING,
      },
      code: {
        defaultValue:0,
        type: Sequelize.STRING,
      },
      hp: {
        defaultValue:0,
        type: Sequelize.STRING,
      },
      note: {
        type: Sequelize.TEXT
      },
      log: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transactions');
  }
};