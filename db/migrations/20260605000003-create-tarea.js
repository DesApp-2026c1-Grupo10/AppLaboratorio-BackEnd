'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tareas', {
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
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      completada: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      tipo: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Tareas');
  },
};
