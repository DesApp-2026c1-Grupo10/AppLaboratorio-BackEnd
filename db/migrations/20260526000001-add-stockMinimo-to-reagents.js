'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Reagents', 'stockMinimo', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Reagents', 'stockMinimo');
  },
};
