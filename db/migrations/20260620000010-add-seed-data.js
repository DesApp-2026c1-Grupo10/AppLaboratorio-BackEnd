'use strict';
module.exports = {
  up: async (queryInterface) => {
    // Seed Sustancias Básicas if empty
    const [existing] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as cnt FROM "SustanciasBasicas"'
    );
    if (parseInt(existing[0].cnt) === 0) {
      await queryInterface.bulkInsert(
        'SustanciasBasicas',
        [
          {
            name: 'Agua destilada',
            descripcion: 'Agua purificada para uso en laboratorio',
            stock: 5000,
            stockMinimo: 1000,
            unidadMedida: 'ml',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Cloruro de sodio',
            descripcion: 'NaCl grado reactivo',
            stock: 2000,
            stockMinimo: 500,
            unidadMedida: 'g',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Bicarbonato de sodio',
            descripcion: 'NaHCO3 grado reactivo',
            stock: 1000,
            stockMinimo: 200,
            unidadMedida: 'g',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Ácido sulfúrico',
            descripcion: 'H2SO4 concentrado',
            stock: 500,
            stockMinimo: 100,
            unidadMedida: 'ml',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Hidróxido de sodio',
            descripcion: 'NaOH en lentejas',
            stock: 800,
            stockMinimo: 150,
            unidadMedida: 'g',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Glucosa',
            descripcion: 'D-glucosa anhidra',
            stock: 600,
            stockMinimo: 100,
            unidadMedida: 'g',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Sulfato de cobre',
            descripcion: 'CuSO4 pentahidratado',
            stock: 300,
            stockMinimo: 50,
            unidadMedida: 'g',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Permanganato de potasio',
            descripcion: 'KMnO4 grado reactivo',
            stock: 200,
            stockMinimo: 30,
            unidadMedida: 'g',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {}
      );
    }
  },
  down: async () => {},
};
