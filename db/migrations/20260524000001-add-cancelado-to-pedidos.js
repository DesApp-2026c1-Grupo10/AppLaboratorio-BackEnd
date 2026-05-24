'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_Pedidos_estado" ADD VALUE IF NOT EXISTS \'Cancelado\''
    );
  },

  down: async () => {},
};
