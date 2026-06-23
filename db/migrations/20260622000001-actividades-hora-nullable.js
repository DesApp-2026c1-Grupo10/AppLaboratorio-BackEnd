'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ActividadesPredefinidas', 'horaInicio', {
      type: Sequelize.TIME,
      allowNull: true,
    });
    await queryInterface.changeColumn('ActividadesPredefinidas', 'horaFin', {
      type: Sequelize.TIME,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ActividadesPredefinidas', 'horaInicio', {
      type: Sequelize.TIME,
      allowNull: false,
    });
    await queryInterface.changeColumn('ActividadesPredefinidas', 'horaFin', {
      type: Sequelize.TIME,
      allowNull: false,
    });
  },
};
