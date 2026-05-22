import request from 'supertest';
import app from '../lib/app';
import db from '../lib/models';

beforeAll(async () => {
  await db.sequelize.authenticate();
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('POST /api/pedidos — creación con inventario', () => {
  it('debería rechazar stock insuficiente de material', async () => {
    // material con stock 0 o bajo
    const res = await request(app)
      .post('/api/pedidos')
      .send({
        fecha: '2026-06-01',
        horaInicio: '08:00',
        horaFin: '10:00',
        laboratorioId: 1,
        cantidadAlumnos: 10,
        usuarioId: 1,
        materiales: [{ id: 9999, cantidad: 100 }], // material inexistente
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('no encontrado');
  });

  it('debería rechazar equipo en mantenimiento', async () => {
    // buscar equipo en mantenimiento
    const equipos = await db.Equipment.findAll();
    const enMant = equipos.find((e) => e.status === 'Mantenimiento');
    if (!enMant) return; // skip si no hay

    const res = await request(app)
      .post('/api/pedidos')
      .send({
        fecha: '2026-06-01',
        horaInicio: '10:00',
        horaFin: '12:00',
        laboratorioId: 1,
        cantidadAlumnos: 10,
        usuarioId: 1,
        equipos: [enMant.id],
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('no está disponible');
  });

  it('debería rechazar conflicto horario', async () => {
    // crear un pedido primero
    await request(app).post('/api/pedidos').send({
      fecha: '2026-07-01',
      horaInicio: '08:00',
      horaFin: '10:00',
      laboratorioId: 1,
      cantidadAlumnos: 5,
      usuarioId: 1,
    });

    // intentar crear otro en el mismo horario
    const res = await request(app).post('/api/pedidos').send({
      fecha: '2026-07-01',
      horaInicio: '09:00',
      horaFin: '11:00',
      laboratorioId: 1,
      cantidadAlumnos: 5,
      usuarioId: 1,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('ocupado');
  });
});

describe('POST /api/pedidos — create y finalizar', () => {
  it('debería crear pedido y finalizarlo con movimientos de stock', async () => {
    // Crear materiales con stock suficiente
    const mat = await db.Material.create({
      name: 'Test Mat',
      stock: 50,
      stockMinimo: 5,
      unit: 'u',
    });
    const rea = await db.Reagent.create({
      name: 'Test Rea',
      stock: 30,
      unidadMedida: 'ml',
    });
    const eq = await db.Equipment.create({
      name: 'Test Eq',
      status: 'Disponible',
      is_movable: true,
    });
    const lab = await db.Laboratorio.findOne();
    if (!lab) return;

    const res = await request(app)
      .post('/api/pedidos')
      .send({
        fecha: '2026-08-15',
        horaInicio: '14:00',
        horaFin: '16:00',
        laboratorioId: lab.id,
        cantidadAlumnos: 5,
        usuarioId: 1,
        materiales: [{ id: mat.id, cantidad: 10 }],
        reactivos: [{ id: rea.id, cantidad: 5 }],
        equipos: [eq.id],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.estado).toBe('Pendiente');

    const pedidoId = res.body.data.id;

    // Aprobar
    const aprobarRes = await request(app).put(
      `/api/pedidos/${pedidoId}/aprobar`
    );
    expect(aprobarRes.status).toBe(200);
    expect(aprobarRes.body.data.estado).toBe('Aprobado');

    // Verificar que equipo cambió a "En uso"
    const eqActualizado = await db.Equipment.findByPk(eq.id);
    expect(eqActualizado.status).toBe('En uso');

    // Finalizar
    const finalizarRes = await request(app)
      .put(`/api/pedidos/${pedidoId}/finalizar`)
      .send({ usuarioId: 1 });
    expect(finalizarRes.status).toBe(200);
    expect(finalizarRes.body.data.estado).toBe('Finalizado');

    // Verificar stock descontado
    const matFinal = await db.Material.findByPk(mat.id);
    expect(matFinal.stock).toBe(40); // 50 - 10

    const reaFinal = await db.Reagent.findByPk(rea.id);
    expect(reaFinal.stock).toBe(25); // 30 - 5

    // Verificar equipo liberado
    const eqFinal = await db.Equipment.findByPk(eq.id);
    expect(eqFinal.status).toBe('Disponible');

    // Verificar movimiento registrado
    const movimientos = await db.MovimientoStock.findAll({
      where: { materialId: mat.id },
    });
    expect(movimientos.length).toBe(1);
    expect(movimientos[0].tipoMovimiento).toBe('salida');

    // Cleanup
    await mat.destroy();
    await rea.destroy();
    await eq.destroy();
  });
});
