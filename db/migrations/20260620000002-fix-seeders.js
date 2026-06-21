'use strict';
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'DELETE FROM "SequelizeMeta" WHERE name = \'20260523000001-inventario-base.js\''
    );
  },
  down: async () => {},
};
