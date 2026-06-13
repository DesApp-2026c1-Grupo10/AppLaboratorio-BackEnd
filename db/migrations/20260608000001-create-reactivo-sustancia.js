'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ReactivoSustancias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      reactivoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Reagents', key: 'id' },
        onDelete: 'CASCADE',
      },
      sustanciaBasicaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'SustanciasBasicas', key: 'id' },
        onDelete: 'CASCADE',
      },
      porcentaje: {
        type: Sequelize.DOUBLE,
        allowNull: false,
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
    await queryInterface.dropTable('ReactivoSustancias');
  },
};
