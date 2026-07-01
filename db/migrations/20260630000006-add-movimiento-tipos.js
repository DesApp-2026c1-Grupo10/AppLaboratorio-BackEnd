'use strict';
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_MovimientosStock_tipoMovimiento" ADD VALUE IF NOT EXISTS 'compra'`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_MovimientosStock_tipoMovimiento" ADD VALUE IF NOT EXISTS 'producido'`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_MovimientosStock_tipoMovimiento" ADD VALUE IF NOT EXISTS 'usado'`
    );
  },
  down: async () => {},
};
