'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Reagents', 'descripcion', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reagents', 'stockMinimo', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Reagents', 'unidadMedida', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Reagents', 'vencimiento', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn('Reagents', 'laboratorioId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Laboratorios', key: 'id' },
      onDelete: 'SET NULL',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Reagents', 'descripcion');
    await queryInterface.removeColumn('Reagents', 'stockMinimo');
    await queryInterface.removeColumn('Reagents', 'unidadMedida');
    await queryInterface.removeColumn('Reagents', 'vencimiento');
    await queryInterface.removeColumn('Reagents', 'laboratorioId');
  },
};
