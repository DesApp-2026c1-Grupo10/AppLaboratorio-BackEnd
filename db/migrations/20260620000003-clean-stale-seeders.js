'use strict';
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'DELETE FROM "SequelizeMeta" WHERE name LIKE \'%seed%\''
    );
  },
  down: async () => {},
};
