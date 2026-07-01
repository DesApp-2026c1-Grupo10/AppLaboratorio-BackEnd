'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Asignar laboratorios existentes a items segun edificio
    const labs = await queryInterface.sequelize.query(
      `SELECT id, nombre, edificio FROM "Laboratorios"`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const malvinasLab = labs.find((l) => l.edificio === 'Malvinas')?.id;
    const libertadorLab = labs.find((l) => l.edificio === 'Libertador')?.id;
    const jsLab = labs.find((l) => l.edificio === 'Justicia Social')?.id;

    // Asignar materiales a edificios
    if (malvinasLab) {
      await queryInterface.sequelize.query(
        `UPDATE "Materials" SET "laboratorioId" = $1 WHERE "laboratorioId" IS NULL AND name IN ('Teclados USB', 'Mouse óptico USB', 'Monitores 22"', 'Estabilizadores eléctricos', 'Cables HDMI 2m', 'Puntas de pipeta', 'Tubos de ensayo')`,
        { bind: [malvinasLab] }
      );
    }
    if (libertadorLab) {
      await queryInterface.sequelize.query(
        `UPDATE "Materials" SET "laboratorioId" = $1 WHERE "laboratorioId" IS NULL AND name IN ('Vasos de precipitado', 'Matraces aforados', 'Buretas', 'Pinzas de laboratorio', 'Probetas 500ml', 'Termómetros digitales', 'Placas de cultivo')`,
        { bind: [libertadorLab] }
      );
    }
    if (jsLab) {
      await queryInterface.sequelize.query(
        `UPDATE "Materials" SET "laboratorioId" = $1 WHERE "laboratorioId" IS NULL AND name IN ('Guantes de látex', 'Gorros quirúrgicos', 'Barbijos N95', 'Lancetas estériles', 'Vendas elásticas')`,
        { bind: [jsLab] }
      );
    }

    // Asignar reactivos a edificios
    if (malvinasLab) {
      await queryInterface.sequelize.query(
        `UPDATE "Reagents" SET "laboratorioId" = $1 WHERE "laboratorioId" IS NULL AND name IN ('Ácido nítrico', 'Ácido clorhídrico 1M', 'Ácido acético glacial', 'Permanganato de potasio 0.1M')`,
        { bind: [malvinasLab] }
      );
    }
    if (libertadorLab) {
      await queryInterface.sequelize.query(
        `UPDATE "Reagents" SET "laboratorioId" = $1 WHERE "laboratorioId" IS NULL AND name IN ('Etanol 96%', 'Azul de metileno', 'Reactivo de Biuret', 'Medio de cultivo LB', 'Glutaraldehído')`,
        { bind: [libertadorLab] }
      );
    }
    if (jsLab) {
      await queryInterface.sequelize.query(
        `UPDATE "Reagents" SET "laboratorioId" = $1 WHERE "laboratorioId" IS NULL AND name IN ('Solución salina', 'Suero fisiológico', 'Hidróxido de amonio')`,
        { bind: [jsLab] }
      );
    }

    // Asignar equipos a edificios
    if (malvinasLab) {
      await queryInterface.sequelize.query(
        `UPDATE "Equipments" SET "laboratorioId" = $1 WHERE "laboratorioId" IS NULL AND name IN ('Computadora de escritorio', 'Impresora 3D', 'Balanza analítica')`,
        { bind: [malvinasLab] }
      );
    }
    if (libertadorLab) {
      await queryInterface.sequelize.query(
        `UPDATE "Equipments" SET "laboratorioId" = $1 WHERE "laboratorioId" IS NULL AND name IN ('Microscopio óptico', 'Espectrofotómetro', 'pH-metro digital', 'Baño María', 'Estufa de secado')`,
        { bind: [libertadorLab] }
      );
    }
    if (jsLab) {
      await queryInterface.sequelize.query(
        `UPDATE "Equipments" SET "laboratorioId" = $1 WHERE "laboratorioId" IS NULL AND name IN ('Centrífuga', 'Incubadora', 'Autoclave', 'Cabina de flujo laminar', 'Electrocardiógrafo', 'Espirómetro', 'Refractómetro')`,
        { bind: [jsLab] }
      );
    }

    // Agregar items en Despensa
    await queryInterface.bulkInsert(
      'Materials',
      [
        {
          name: 'Cinta adhesiva',
          descripcion: 'Cinta adhesiva transparente',
          stock: 100,
          stockMinimo: 20,
          unit: 'unidades',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Marcadores permanentes',
          descripcion: 'Marcador indeleble punta fina',
          stock: 80,
          stockMinimo: 10,
          unit: 'unidades',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Etiquetas autoadhesivas',
          descripcion: 'Etiquetas para identificación',
          stock: 500,
          stockMinimo: 50,
          unit: 'unidades',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Pilas AA',
          descripcion: 'Pilas alcalinas AA 1.5V',
          stock: 60,
          stockMinimo: 10,
          unit: 'pares',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Cables USB',
          descripcion: 'Cable USB-A a USB-B 1.5m',
          stock: 40,
          stockMinimo: 5,
          unit: 'unidades',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Cables de red RJ45',
          descripcion: 'Cable de red CAT6 2m',
          stock: 30,
          stockMinimo: 5,
          unit: 'unidades',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Zapatos de seguridad',
          descripcion: 'Calzado de seguridad talla 42',
          stock: 15,
          stockMinimo: 3,
          unit: 'pares',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Delantales descartables',
          descripcion: 'Delantal plástico descartable',
          stock: 200,
          stockMinimo: 30,
          unit: 'unidades',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Tiras reactivas pH',
          descripcion: 'Tiras para medición de pH 1-14',
          stock: 10,
          stockMinimo: 2,
          unit: 'cajas',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Papel filtro',
          descripcion: 'Papel de filtro cualitativo',
          stock: 20,
          stockMinimo: 5,
          unit: 'paquetes',
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      'Reagents',
      [
        {
          name: 'Agua oxigenada 3%',
          descripcion: 'Peróxido de hidrógeno 3%',
          stock: 500,
          stockMinimo: 100,
          unidadMedida: 'ml',
          vencimiento: '2027-06-01',
          prep_time: 0,
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Azul de bromofenol',
          descripcion: 'Indicador de pH',
          stock: 100,
          stockMinimo: 20,
          unidadMedida: 'ml',
          vencimiento: '2027-01-15',
          prep_time: 0,
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Fenolftaleína',
          descripcion: 'Indicador ácido-base',
          stock: 150,
          stockMinimo: 30,
          unidadMedida: 'ml',
          vencimiento: '2026-09-30',
          prep_time: 0,
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Naranja de metilo',
          descripcion: 'Indicador de pH 3.1-4.4',
          stock: 100,
          stockMinimo: 15,
          unidadMedida: 'g',
          vencimiento: '2027-02-20',
          prep_time: 0,
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Yodo metálico',
          descripcion: 'I2 cristalino grado reactivo',
          stock: 200,
          stockMinimo: 30,
          unidadMedida: 'g',
          vencimiento: '2027-08-15',
          prep_time: 0,
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Sulfato ferroso',
          descripcion: 'FeSO4 heptahidratado',
          stock: 300,
          stockMinimo: 50,
          unidadMedida: 'g',
          vencimiento: '2026-11-10',
          prep_time: 0,
          laboratorioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      'Equipments',
      [
        {
          name: 'Multímetro digital',
          descripcion: 'Multímetro digital portátil',
          status: 'Disponible',
          is_movable: true,
          laboratorioId: null,
          ultimaRevision: '2026-03-15',
          observaciones: 'Con puntas de prueba',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Generador de funciones',
          descripcion: 'Generador de señales 20MHz',
          status: 'Disponible',
          is_movable: true,
          laboratorioId: null,
          ultimaRevision: '2026-02-10',
          observaciones: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Osciloscopio digital',
          descripcion: 'Osciloscopio 2 canales 100MHz',
          status: 'Disponible',
          is_movable: false,
          laboratorioId: null,
          ultimaRevision: '2026-01-20',
          observaciones: 'Sondas 10x incluidas',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Fuente de alimentación DC',
          descripcion: 'Fuente regulable 30V 5A',
          status: 'Disponible',
          is_movable: true,
          laboratorioId: null,
          ultimaRevision: '2026-04-05',
          observaciones: 'Salida dual',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Agitador magnético',
          descripcion: 'Agitador con calefacción',
          status: 'Disponible',
          is_movable: true,
          laboratorioId: null,
          ultimaRevision: '2026-03-01',
          observaciones: 'Barra magnética incluida',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Vortex',
          descripcion: 'Mezclador tipo vortex',
          status: 'Disponible',
          is_movable: true,
          laboratorioId: null,
          ultimaRevision: '2026-02-28',
          observaciones: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Micropipeta 100-1000ul',
          descripcion: 'Micropipeta variable monocanal',
          status: 'Disponible',
          is_movable: true,
          laboratorioId: null,
          ultimaRevision: '2026-03-10',
          observaciones: 'Calibrada',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Lámpara UV',
          descripcion: 'Lámpara de luz ultravioleta 254nm',
          status: 'Disponible',
          is_movable: true,
          laboratorioId: null,
          ultimaRevision: '2026-01-30',
          observaciones: 'Gafas protectoras incluidas',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Cámara de electroforesis',
          descripcion: 'Cuba para electroforesis en gel',
          status: 'Disponible',
          is_movable: true,
          laboratorioId: null,
          ultimaRevision: '2026-04-01',
          observaciones: 'Con fuente de poder',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface) => {
    // Revertir asignaciones
    await queryInterface.sequelize.query(
      `UPDATE "Materials" SET "laboratorioId" = NULL WHERE "laboratorioId" IS NOT NULL`
    );
    await queryInterface.sequelize.query(
      `UPDATE "Reagents" SET "laboratorioId" = NULL WHERE "laboratorioId" IS NOT NULL`
    );
    await queryInterface.sequelize.query(
      `UPDATE "Equipments" SET "laboratorioId" = NULL WHERE "laboratorioId" IS NOT NULL`
    );
    // Eliminar items de despensa agregados
    await queryInterface.bulkDelete(
      'Equipments',
      {
        name: [
          'Multímetro digital',
          'Generador de funciones',
          'Osciloscopio digital',
          'Fuente de alimentación DC',
          'Agitador magnético',
          'Vortex',
          'Micropipeta 100-1000ul',
          'Lámpara UV',
          'Cámara de electroforesis',
        ],
      },
      {}
    );
    await queryInterface.bulkDelete(
      'Reagents',
      {
        name: [
          'Agua oxigenada 3%',
          'Azul de bromofenol',
          'Fenolftaleína',
          'Naranja de metilo',
          'Yodo metálico',
          'Sulfato ferroso',
        ],
      },
      {}
    );
    await queryInterface.bulkDelete(
      'Materials',
      {
        name: [
          'Cinta adhesiva',
          'Marcadores permanentes',
          'Etiquetas autoadhesivas',
          'Pilas AA',
          'Cables USB',
          'Cables de red RJ45',
          'Zapatos de seguridad',
          'Delantales descartables',
          'Tiras reactivas pH',
          'Papel filtro',
        ],
      },
      {}
    );
  },
};
