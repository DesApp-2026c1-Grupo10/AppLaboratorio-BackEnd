'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_PedidoRevisiones_estado" ADD VALUE IF NOT EXISTS \'respuesta\';'
    );
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_PedidoRevisiones_estado" ADD VALUE IF NOT EXISTS \'mensaje\';'
    );
  },

  down: async (queryInterface, Sequelize) => {
    // PostgreSQL no permite eliminar valores de un enum fácilmente
  },
};
