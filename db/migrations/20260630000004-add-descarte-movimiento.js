'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_MovimientosStock_tipoMovimiento" ADD VALUE \'descarte\''
    );
  },

  down: async (queryInterface) => {
    // No se puede remover un valor de enum en PostgreSQL fácilmente
  },
};
