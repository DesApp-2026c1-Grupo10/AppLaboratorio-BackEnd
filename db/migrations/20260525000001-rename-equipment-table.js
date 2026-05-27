'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Equipment') && !tables.includes('Equipments')) {
      await queryInterface.renameTable('Equipment', 'Equipments');
    }
  },
  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Equipments') && !tables.includes('Equipment')) {
      await queryInterface.renameTable('Equipments', 'Equipment');
    }
  },
};
