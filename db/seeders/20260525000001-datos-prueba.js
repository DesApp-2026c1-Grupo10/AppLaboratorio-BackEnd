'use strict';
const bcrypt = require('bcryptjs');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hash = bcrypt.hashSync('123', 10);
    await queryInterface.bulkInsert(
      'Usuarios',
      [
        {
          nombre: 'Carlos',
          apellido: 'Desarrollador',
          email: 'desarrollador@test.com',
          password: hash,
          rol: 'Desarrollador',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Maria',
          apellido: 'Profesora',
          email: 'profesora@test.com',
          password: hash,
          rol: 'Profesor',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Juan',
          apellido: 'Alumno',
          email: 'alumno@test.com',
          password: hash,
          rol: 'Alumno',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    const labExistente = await queryInterface.rawSelect(
      'Laboratorios',
      { where: { nombre: 'Laboratorio Matematicas A' } },
      ['id']
    );
    if (!labExistente) {
      await queryInterface.bulkInsert(
        'Laboratorios',
        [
          {
            nombre: 'Laboratorio Matematicas A',
            capacidad: 30,
            edificio: 'Malvinas',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Quimica B',
            capacidad: 25,
            edificio: 'Malvinas',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Biologia C',
            capacidad: 20,
            edificio: 'Libertador',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Fisica D',
            capacidad: 35,
            edificio: 'Libertador',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {}
      );
    }
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete(
      'Usuarios',
      {
        email: [
          'desarrollador@test.com',
          'profesora@test.com',
          'alumno@test.com',
        ],
      },
      {}
    );
  },
};
