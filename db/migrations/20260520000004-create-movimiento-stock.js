'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MovimientosStock', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tipoMovimiento: {
        type: Sequelize.ENUM('entrada', 'salida'),
        allowNull: false,
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      observacion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Usuarios', key: 'id' },
        onDelete: 'CASCADE',
      },
      materialId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Materials', key: 'id' },
        onDelete: 'SET NULL',
      },
      reactivoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Reagents', key: 'id' },
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('MovimientosStock');
  },
};
