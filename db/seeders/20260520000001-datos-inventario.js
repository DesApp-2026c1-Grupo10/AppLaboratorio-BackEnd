'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Equipment', [
      {
        name: 'Microscopio Óptico',
        bld_id: 1,
        status: 'AVAILABLE',
        is_movable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Centrífuga',
        bld_id: 2,
        status: 'MAINTENANCE',
        is_movable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Espectrofotómetro',
        bld_id: 1,
        status: 'IN_USE',
        is_movable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Balanza Digital',
        bld_id: 1,
        status: 'AVAILABLE',
        is_movable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Autoclave',
        bld_id: 2,
        status: 'AVAILABLE',
        is_movable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('Materials', [
      {
        name: 'Etanol',
        stock: 250,
        unit: 'ml',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Medio de Cultivo',
        stock: 140,
        unit: 'ml',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Papel Filtro',
        stock: 500,
        unit: 'unidades',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Guantes de Latex',
        stock: 1000,
        unit: 'unidades',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('Reagents', [
      {
        name: 'Ácido Sulfúrico',
        stock: 80,
        prep_time: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Hidróxido de Sodio',
        stock: 60,
        prep_time: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Azul de Metileno',
        stock: 30,
        prep_time: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Reagents', null, {});
    await queryInterface.bulkDelete('Materials', null, {});
    await queryInterface.bulkDelete('Equipment', null, {});
  },
};
