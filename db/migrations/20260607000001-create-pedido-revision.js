'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PedidoRevisiones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pedidoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Pedidos', key: 'id' },
        onDelete: 'CASCADE',
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Usuarios', key: 'id' },
        onDelete: 'CASCADE',
      },
      comentario: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cambios: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aceptada', 'rechazada'),
        defaultValue: 'pendiente',
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
    await queryInterface.dropTable('PedidoRevisiones');
  },
};
