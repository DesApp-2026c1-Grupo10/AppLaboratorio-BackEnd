'use strict';
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'TRUNCATE TABLE "ModificacionPedidos" RESTART IDENTITY CASCADE;'
    );
  },
  down: async () => {},
};
