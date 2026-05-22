'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Materials', 'descripcion', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Materials', 'stockMinimo', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Materials', 'laboratorioId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Laboratorios', key: 'id' },
      onDelete: 'SET NULL',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Materials', 'descripcion');
    await queryInterface.removeColumn('Materials', 'stockMinimo');
    await queryInterface.removeColumn('Materials', 'laboratorioId');
  },
};
