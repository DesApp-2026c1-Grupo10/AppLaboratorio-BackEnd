'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_ModificacionPedidos_tipo" ADD VALUE IF NOT EXISTS \'CANCELACION\''
    );
  },

  down: async () => {},
};
