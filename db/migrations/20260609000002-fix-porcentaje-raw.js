'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      'ALTER TABLE "ReactivoSustancias" ALTER COLUMN "porcentaje" TYPE DOUBLE PRECISION'
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      'ALTER TABLE "ReactivoSustancias" ALTER COLUMN "porcentaje" TYPE INTEGER USING "porcentaje"::integer'
    );
  },
};
