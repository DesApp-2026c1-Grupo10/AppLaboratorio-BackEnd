'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Carritos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      pedidoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Pedidos', key: 'id' },
        onDelete: 'CASCADE',
      },
      preparado: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('CarritoItems', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      carritoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Carritos', key: 'id' },
        onDelete: 'CASCADE',
      },
      tipo: { type: Sequelize.STRING, allowNull: false },
      itemId: { type: Sequelize.INTEGER, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false },
      cantidad: { type: Sequelize.INTEGER, allowNull: false },
      preparado: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('CarritoItems');
    await queryInterface.dropTable('Carritos');
  },
};
