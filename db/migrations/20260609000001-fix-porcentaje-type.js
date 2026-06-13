'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ReactivoSustancias', 'porcentaje', {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ReactivoSustancias', 'porcentaje', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
