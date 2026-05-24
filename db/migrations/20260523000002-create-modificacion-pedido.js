'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ModificacionPedidos', {
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
        allowNull: true,
        references: { model: 'Usuarios', key: 'id' },
      },
      tipo: {
        type: Sequelize.ENUM(
          'CREACION',
          'MODIFICACION',
          'APROBACION',
          'RECHAZO',
          'FINALIZACION'
        ),
        allowNull: false,
      },
      // JSON con los cambios: { campo: { antes: valor1, despues: valor2 } }
      cambios: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      descripcion: {
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ModificacionPedidos');
  },
};
