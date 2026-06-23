'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Materiales
    await queryInterface.bulkInsert(
      'Materials',
      [
        {
          name: 'Tubos de ensayo',
          descripcion: 'Tubos de vidrio de 10ml',
          stock: 200,
          stockMinimo: 30,
          unit: 'unidades',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Puntas de pipeta',
          descripcion: 'Puntas descartables para micropipetas',
          stock: 500,
          stockMinimo: 100,
          unit: 'unidades',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Placas de cultivo',
          descripcion: 'Placas Petri estériles',
          stock: 80,
          stockMinimo: 20,
          unit: 'unidades',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Guantes de látex',
          descripcion: 'Guantes descartables talla M',
          stock: 10,
          stockMinimo: 50,
          unit: 'pares',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Vasos de precipitado',
          descripcion: 'Vasos de 250ml',
          stock: 45,
          stockMinimo: 10,
          unit: 'unidades',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Reactivos
    await queryInterface.bulkInsert(
      'Reagents',
      [
        {
          name: 'Ácido nítrico',
          descripcion: 'HNO3 concentrado',
          stock: 500,
          stockMinimo: 100,
          unidadMedida: 'ml',
          vencimiento: '2027-06-15',
          prep_time: 0,
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Etanol 96%',
          descripcion: 'Alcohol etílico 96°',
          stock: 1000,
          stockMinimo: 200,
          unidadMedida: 'ml',
          vencimiento: '2026-12-20',
          prep_time: 0,
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Azul de metileno',
          descripcion: 'Colorante para tinción',
          stock: 250,
          stockMinimo: 50,
          unidadMedida: 'ml',
          vencimiento: '2026-08-10',
          prep_time: 5,
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Medio de cultivo LB',
          descripcion: 'Medio Luria-Bertani',
          stock: 15,
          stockMinimo: 30,
          unidadMedida: 'g',
          vencimiento: '2026-07-01',
          prep_time: 20,
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Solución salina',
          descripcion: 'NaCl 0.9% estéril',
          stock: 2000,
          stockMinimo: 500,
          unidadMedida: 'ml',
          vencimiento: '2027-01-10',
          prep_time: 10,
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Equipos
    await queryInterface.bulkInsert(
      'Equipments',
      [
        {
          name: 'Microscopio óptico',
          descripcion: 'Microscopio binocular 40x-1000x',
          status: 'Disponible',
          is_movable: false,
          bld_id: 1,
          laboratorioId: null,
          ultimaRevision: '2026-01-15',
          observaciones: 'Funcionando correctamente',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Centrífuga',
          descripcion: 'Centrífuga de mesa 5000rpm',
          status: 'Mantenimiento',
          is_movable: true,
          bld_id: 1,
          laboratorioId: null,
          ultimaRevision: '2026-03-10',
          observaciones: 'Cambiar rotor',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Espectrofotómetro',
          descripcion: 'Espectrofotómetro UV-Vis',
          status: 'Disponible',
          is_movable: false,
          bld_id: 2,
          laboratorioId: null,
          ultimaRevision: '2026-02-20',
          observaciones: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Incubadora',
          descripcion: 'Incubadora microbiológica 37°C',
          status: 'En uso',
          is_movable: false,
          bld_id: 1,
          laboratorioId: null,
          ultimaRevision: '2026-04-01',
          observaciones: 'En uso por el laboratorio de biología',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Baño María',
          descripcion: 'Baño termostático digital',
          status: 'Fuera de servicio',
          is_movable: true,
          bld_id: 2,
          laboratorioId: null,
          ultimaRevision: '2025-11-05',
          observaciones: 'Resistencia quemada',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Sustancias Básicas
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
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Materials', null, {});
    await queryInterface.bulkDelete('Reagents', null, {});
    await queryInterface.bulkDelete('Equipments', null, {});
    await queryInterface.bulkDelete('SustanciasBasicas', null, {});
  },
};
