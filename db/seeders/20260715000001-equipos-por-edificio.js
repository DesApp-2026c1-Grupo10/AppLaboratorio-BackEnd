'use strict';

module.exports = {
  up: async (queryInterface) => {
    const labs = await queryInterface.sequelize.query(
      `SELECT id, nombre, edificio FROM "Laboratorios"`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkDelete('PedidoEquipos', {}, {});
    await queryInterface.bulkDelete('Equipments', {}, {});

    const labByName = {};
    labs.forEach((l) => {
      labByName[l.nombre] = l.id;
    });

    const malvinasLabs = labs
      .filter((l) => l.edificio === 'Malvinas')
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    const libertadorLabs = labs
      .filter((l) => l.edificio === 'Libertador')
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    const jsLabs = labs
      .filter((l) => l.edificio === 'Justicia Social')
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    const now = new Date();

    const equipos = [
      // === Malvinas: 2 movibles entre edificios ===
      {
        name: 'Proyector multimedia',
        descripcion: 'Proyector HD 4000 lúmenes',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: null,
        ultimaRevision: '2026-06-01',
        observaciones: 'Control remoto incluido',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Impresora 3D',
        descripcion: 'Impresora 3D FDM 300x300mm',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: null,
        ultimaRevision: '2026-05-15',
        observaciones: 'Filamento PLA incluido',
        createdAt: now,
        updatedAt: now,
      },
      // === Malvinas: 2 movibles entre aulas ===
      {
        name: 'Computadora portátil',
        descripcion: 'Notebook i7 16GB RAM',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: malvinasLabs[0]?.id || null,
        ultimaRevision: '2026-06-10',
        observaciones: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Tablet educativa',
        descripcion: 'Tablet 10" con lápiz digital',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: malvinasLabs[1]?.id || null,
        ultimaRevision: '2026-04-20',
        observaciones: '',
        createdAt: now,
        updatedAt: now,
      },
      // === Malvinas: 1 fijo por aula ===
      {
        name: 'Servidor de datos',
        descripcion: 'Servidor rack 24TB',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: malvinasLabs[0]?.id || null,
        ultimaRevision: '2026-03-01',
        observaciones: 'Ubicado en rack cerrado',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Balanza analítica',
        descripcion: 'Balanza de precisión 0.1mg',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: malvinasLabs[1]?.id || null,
        ultimaRevision: '2026-02-15',
        observaciones: 'Calibrada',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Escaner 3D',
        descripcion: 'Escaner 3D de escritorio',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: malvinasLabs[2]?.id || null,
        ultimaRevision: '2026-05-01',
        observaciones: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Computadora de escritorio',
        descripcion: 'PC i5 16GB RAM + monitor 22"',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: malvinasLabs[3]?.id || null,
        ultimaRevision: '2026-04-01',
        observaciones: '',
        createdAt: now,
        updatedAt: now,
      },

      // === Libertador: 2 movibles entre edificios ===
      {
        name: 'Microscopio portátil',
        descripcion: 'Microscopio digital portátil 200x',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: null,
        ultimaRevision: '2026-06-05',
        observaciones: 'Batería recargable',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'pH-metro digital',
        descripcion: 'Medidor de pH portátil',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: null,
        ultimaRevision: '2026-03-20',
        observaciones: 'Soluciones de calibración incluidas',
        createdAt: now,
        updatedAt: now,
      },
      // === Libertador: 2 movibles entre aulas ===
      {
        name: 'Baño María',
        descripcion: 'Baño termostático digital 20L',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: libertadorLabs[0]?.id || null,
        ultimaRevision: '2026-04-10',
        observaciones: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Espectrofotómetro',
        descripcion: 'Espectrofotómetro UV-Vis',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: libertadorLabs[2]?.id || null,
        ultimaRevision: '2026-05-20',
        observaciones: 'Celdas de cuarzo incluidas',
        createdAt: now,
        updatedAt: now,
      },
      // === Libertador: 1 fijo por aula ===
      {
        name: 'Microscopio óptico',
        descripcion: 'Microscopio binocular 1000x',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: libertadorLabs[0]?.id || null,
        ultimaRevision: '2026-01-10',
        observaciones: 'Lentes objetivo 4x-100x',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Centrífuga',
        descripcion: 'Centrífuga de mesa 5000rpm',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: libertadorLabs[1]?.id || null,
        ultimaRevision: '2026-02-20',
        observaciones: 'Rotor para 12 tubos',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Cabina de flujo laminar',
        descripcion: 'Cabina de bioseguridad clase II',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: libertadorLabs[2]?.id || null,
        ultimaRevision: '2026-03-15',
        observaciones: 'Filtro HEPA reemplazado',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Autoclave',
        descripcion: 'Autoclave vertical 50L',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: libertadorLabs[3]?.id || null,
        ultimaRevision: '2026-04-05',
        observaciones: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Estufa de secado',
        descripcion: 'Estufa de secado 200°C',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: libertadorLabs[4]?.id || null,
        ultimaRevision: '2026-05-10',
        observaciones: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Generador de funciones',
        descripcion: 'Generador de señales 20MHz',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: libertadorLabs[5]?.id || null,
        ultimaRevision: '2026-02-10',
        observaciones: '',
        createdAt: now,
        updatedAt: now,
      },

      // === Justicia Social: 2 movibles entre edificios ===
      {
        name: 'Electrocardiógrafo portátil',
        descripcion: 'ECG portátil de 12 derivaciones',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: null,
        ultimaRevision: '2026-06-15',
        observaciones: 'Electrodos reutilizables',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Desfibrilador portátil',
        descripcion: 'DEA automático',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: null,
        ultimaRevision: '2026-05-25',
        observaciones: 'Parches incluidos',
        createdAt: now,
        updatedAt: now,
      },
      // === Justicia Social: 2 movibles entre aulas ===
      {
        name: 'Espirómetro',
        descripcion: 'Espirómetro digital portátil',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: jsLabs[0]?.id || null,
        ultimaRevision: '2026-04-25',
        observaciones: 'Boquillas descartables',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Refractómetro',
        descripcion: 'Refractómetro digital',
        status: 'Disponible',
        is_movable: true,
        laboratorioId: jsLabs[4]?.id || null,
        ultimaRevision: '2026-03-30',
        observaciones: '',
        createdAt: now,
        updatedAt: now,
      },
      // === Justicia Social: 1 fijo por aula ===
      {
        name: 'Incubadora',
        descripcion: 'Incubadora bacteriologica 37°C',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: jsLabs[0]?.id || null,
        ultimaRevision: '2026-01-20',
        observaciones: 'Control digital de temperatura',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Electrocardiógrafo',
        descripcion: 'ECG de escritorio 12 derivaciones',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: jsLabs[1]?.id || null,
        ultimaRevision: '2026-02-28',
        observaciones: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Máquina de ultrasonido',
        descripcion: 'Ecógrafo terapéutico 1MHz',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: jsLabs[2]?.id || null,
        ultimaRevision: '2026-04-15',
        observaciones: 'Transductor de 5cm2',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Vortex',
        descripcion: 'Mezclador tipo vortex',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: jsLabs[3]?.id || null,
        ultimaRevision: '2026-02-28',
        observaciones: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Agitador magnético',
        descripcion: 'Agitador con calefacción',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: jsLabs[4]?.id || null,
        ultimaRevision: '2026-03-01',
        observaciones: 'Barra magnética incluida',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Lámpara UV',
        descripcion: 'Lámpara de luz ultravioleta 254nm',
        status: 'Disponible',
        is_movable: false,
        laboratorioId: jsLabs[5]?.id || null,
        ultimaRevision: '2026-01-30',
        observaciones: 'Gafas protectoras incluidas',
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('Equipments', equipos, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Equipments', {}, {});
  },
};
