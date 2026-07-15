'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('PedidoEquipos', 'laboratorioIdOriginal', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('PedidoEquipos', 'laboratorioIdOriginal');
  },
};
