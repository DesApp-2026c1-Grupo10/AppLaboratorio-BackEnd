'use strict';

module.exports = {

  up: async (
    queryInterface,
    Sequelize
  ) => {

    await queryInterface.addColumn(
      'Pedidos',
      'cantidadAlumnos',
      {
        type:
          Sequelize.INTEGER,

        allowNull: false,

        defaultValue: 1,
      }
    );
  },

  down: async (
    queryInterface
  ) => {

    await queryInterface.removeColumn(
      'Pedidos',
      'cantidadAlumnos'
    );
  },
};
