import request from 'supertest';
import app from '../lib/app';
import db from '../lib/models';

beforeAll(async () => {
  await db.sequelize.authenticate();
});

describe('POST /api/pedidos — creación con inventario', () => {
  let lab;
  let user;

  beforeAll(async () => {
    lab = await db.Laboratorio.create({
      nombre: 'Lab Pedido Test',
      capacidad: 30,
      edificio: 'A',
    });
    user = await db.Usuario.create({
      nombre: 'Test',
      apellido: 'User',
      email: `test-${Date.now()}@test.com`,
      password: '123',
      rol: 'Profesor',
    });
  });

  afterAll(async () => {});

  it('debería crear con advertencia si el material no existe', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .send({
        fecha: '2026-06-01',
        horaInicio: '08:00',
        horaFin: '10:00',
        laboratorioId: lab.id,
        cantidadAlumnos: 10,
        usuarioId: user.id,
        materiales: [{ id: 9999, cantidad: 100 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.warnings.some((w) => w.includes('no encontrado'))).toBe(
      true
    );
  });

  it('debería crear con advertencia si el equipo no está disponible', async () => {
    const equipos = await db.Equipment.findAll();
    const enMant = equipos.find((e) => e.status === 'Mantenimiento');
    if (!enMant) return;

    const res = await request(app)
      .post('/api/pedidos')
      .send({
        fecha: '2026-06-01',
        horaInicio: '10:00',
        horaFin: '12:00',
        laboratorioId: lab.id,
        cantidadAlumnos: 10,
        usuarioId: user.id,
        equipos: [enMant.id],
      });
    expect(res.status).toBe(201);
    expect(
      res.body.warnings.some((w) => w.includes('no está disponible'))
    ).toBe(true);
  });

  it('debería rechazar conflicto horario', async () => {
    const lab = await db.Laboratorio.create({
      nombre: 'Lab Test',
      capacidad: 30,
      edificio: 'A',
    });
    const usr = await db.Usuario.create({
      nombre: 'Conflicto',
      apellido: 'Test',
      email: `conflicto-${Date.now()}@test.com`,
      password: '123',
      rol: 'Profesor',
    });

    await request(app).post('/api/pedidos').send({
      fecha: '2026-07-01',
      horaInicio: '08:00',
      horaFin: '10:00',
      laboratorioId: lab.id,
      cantidadAlumnos: 5,
      usuarioId: usr.id,
    });

    const res = await request(app).post('/api/pedidos').send({
      fecha: '2026-07-01',
      horaInicio: '09:00',
      horaFin: '11:00',
      laboratorioId: lab.id,
      cantidadAlumnos: 5,
      usuarioId: usr.id,
    });
    expect(res.status).toBe(201);
    expect(
      res.body.warnings.some(
        (w) => w.includes('ocupado') || w.includes('conflicto')
      )
    ).toBe(true);
  });
});

describe('POST /api/pedidos — create y finalizar', () => {
  it('debería crear pedido y finalizarlo con movimientos de stock', async () => {
    const user = await db.Usuario.create({
      nombre: 'Finalizar',
      apellido: 'Test',
      email: `finalizar-${Date.now()}@test.com`,
      password: '123',
      rol: 'Profesor',
    });
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
        usuarioId: user.id,
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
      .send({ usuarioId: user.id });
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
  });
});
