'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_Pedidos_estado" ADD VALUE \'Finalizado\''
    );
  },
  down: async (queryInterface, Sequelize) => {
    // No se puede remover valores de un ENUM en PostgreSQL sin recrearlo
  },
};
