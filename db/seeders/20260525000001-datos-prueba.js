'use strict';
const bcrypt = require('bcryptjs');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hash1 = bcrypt.hashSync('123', 10);
    const hash2 = bcrypt.hashSync('112233', 10);
    await queryInterface.bulkInsert(
      'Usuarios',
      [
        {
          nombre: 'Carlos',
          apellido: 'Desarrollador',
          email: 'desarrollador@test.com',
          password: hash1,
          rol: 'Desarrollador',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Maria',
          apellido: 'Profesora',
          email: 'profesora@test.com',
          password: hash2,
          rol: 'Profesor',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    const labExistente = await queryInterface.rawSelect(
      'Laboratorios',
      { where: { nombre: 'Laboratorio Computacion 1' } },
      ['id']
    );
    if (!labExistente) {
      await queryInterface.bulkInsert(
        'Laboratorios',
        [
          {
            nombre: 'Laboratorio Computacion 1',
            capacidad: 30,
            edificio: 'Malvinas',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Computacion 2',
            capacidad: 30,
            edificio: 'Malvinas',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Computacion 3',
            capacidad: 25,
            edificio: 'Malvinas',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Computacion 4',
            capacidad: 35,
            edificio: 'Malvinas',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Biologia 1',
            capacidad: 20,
            edificio: 'Libertador',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Biologia 2',
            capacidad: 20,
            edificio: 'Libertador',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Quimica 1',
            capacidad: 25,
            edificio: 'Libertador',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Quimica 2',
            capacidad: 25,
            edificio: 'Libertador',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Fisica 1',
            capacidad: 35,
            edificio: 'Libertador',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Fisica 2',
            capacidad: 35,
            edificio: 'Libertador',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Medicina 1',
            capacidad: 30,
            edificio: 'Justicia Social',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Medicina 2',
            capacidad: 30,
            edificio: 'Justicia Social',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Kinesiologia 1',
            capacidad: 25,
            edificio: 'Justicia Social',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Kinesiologia 2',
            capacidad: 25,
            edificio: 'Justicia Social',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Bromatologia 1',
            capacidad: 20,
            edificio: 'Justicia Social',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            nombre: 'Laboratorio Bromatologia 2',
            capacidad: 20,
            edificio: 'Justicia Social',
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
      { email: ['desarrollador@test.com', 'profesora@test.com'] },
      {}
    );
  },
};
