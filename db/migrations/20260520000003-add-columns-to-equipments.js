'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Equipments', 'descripcion', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Equipments', 'laboratorioId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Laboratorios', key: 'id' },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('Equipments', 'ultimaRevision', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn('Equipments', 'observaciones', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Equipments', 'descripcion');
    await queryInterface.removeColumn('Equipments', 'laboratorioId');
    await queryInterface.removeColumn('Equipments', 'ultimaRevision');
    await queryInterface.removeColumn('Equipments', 'observaciones');
  },
};
