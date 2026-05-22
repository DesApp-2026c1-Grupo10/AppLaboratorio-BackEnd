'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UsosEquipo', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      equipoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Equipments', key: 'id' },
        onDelete: 'CASCADE',
      },
      pedidoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Pedidos', key: 'id' },
        onDelete: 'SET NULL',
      },
      fechaInicio: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      fechaFin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('UsosEquipo');
  },
};
