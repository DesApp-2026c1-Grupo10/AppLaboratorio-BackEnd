'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuarios', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: 'correo@ejemplo.com',
    });

    await queryInterface.addColumn('Usuarios', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '123456', // Contraseña por defecto para usuarios existentes
    });

    await queryInterface.addColumn('Usuarios', 'rol', {
      type: Sequelize.STRING,
      defaultValue: 'Alumno',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuarios', 'email');
    await queryInterface.removeColumn('Usuarios', 'password');
    await queryInterface.removeColumn('Usuarios', 'rol');
  },
};
