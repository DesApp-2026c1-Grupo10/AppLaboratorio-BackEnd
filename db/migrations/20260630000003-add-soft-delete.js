'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Materials', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Reagents', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Equipments', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('SustanciasBasicas', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Materials', 'deletedAt');
    await queryInterface.removeColumn('Reagents', 'deletedAt');
    await queryInterface.removeColumn('Equipments', 'deletedAt');
    await queryInterface.removeColumn('SustanciasBasicas', 'deletedAt');
  },
};
