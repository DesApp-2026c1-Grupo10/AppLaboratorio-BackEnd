import request from 'supertest';
import app from '../lib/app';
import db from '../lib/models';
import { authHeader } from './auth.js';

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
      .set(authHeader(user))
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
      .set(authHeader(user))
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

    await request(app).post('/api/pedidos').set(authHeader(usr)).send({
      fecha: '2026-07-01',
      horaInicio: '08:00',
      horaFin: '10:00',
      laboratorioId: lab.id,
      cantidadAlumnos: 5,
      usuarioId: usr.id,
    });

    const res = await request(app)
      .post('/api/pedidos')
      .set(authHeader(usr))
      .send({
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
      .set(authHeader(user))
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
    const aprobarRes = await request(app)
      .put(`/api/pedidos/${pedidoId}/aprobar`)
      .set(authHeader(user));
    expect(aprobarRes.status).toBe(200);
    expect(aprobarRes.body.data.estado).toBe('Aprobado');

    // Verificar que equipo sigue disponible (reserva por horario)
    const eqActualizado = await db.Equipment.findByPk(eq.id);
    expect(eqActualizado.status).toBe('Disponible');

    // Finalizar
    const finalizarRes = await request(app)
      .put(`/api/pedidos/${pedidoId}/finalizar`)
      .set(authHeader(user))
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
    expect(['usado', 'salida']).toContain(movimientos[0].tipoMovimiento);
  });

  it('debería generar tareas automáticas al aprobar un pedido', async () => {
    const user = await db.Usuario.create({
      nombre: 'Tareas',
      apellido: 'Test',
      email: `tareas-${Date.now()}@test.com`,
      password: '123',
      rol: 'Profesor',
    });
    const mat = await db.Material.create({
      name: 'Mat Tarea',
      stock: 10,
      stockMinimo: 1,
      unit: 'u',
    });
    const rea = await db.Reagent.create({
      name: 'Rea Tarea',
      stock: 10,
      unidadMedida: 'ml',
    });
    const eq = await db.Equipment.create({
      name: 'Eq Tarea',
      status: 'Disponible',
      is_movable: true,
    });
    const lab = await db.Laboratorio.findOne();
    if (!lab) return;

    const res = await request(app)
      .post('/api/pedidos')
      .set(authHeader(user))
      .send({
        fecha: '2026-09-01',
        horaInicio: '08:00',
        horaFin: '10:00',
        laboratorioId: lab.id,
        cantidadAlumnos: 5,
        usuarioId: user.id,
        materiales: [{ id: mat.id, cantidad: 2 }],
        reactivos: [{ id: rea.id, cantidad: 3 }],
        equipos: [eq.id],
      });
    const pedidoId = res.body.data.id;

    // Aprobar
    await request(app)
      .put(`/api/pedidos/${pedidoId}/aprobar`)
      .set(authHeader(user));

    // Verificar tareas generadas
    const tareasRes = await request(app)
      .get(`/api/pedidos/${pedidoId}/tareas`)
      .set(authHeader(user));
    expect(tareasRes.status).toBe(200);
    expect(tareasRes.body.data.length).toBeGreaterThanOrEqual(4); // material + reactivo + equipo + general
    expect(
      tareasRes.body.data.some((t) => t.descripcion.includes('Mat Tarea'))
    ).toBe(true);
    expect(
      tareasRes.body.data.some((t) => t.descripcion.includes('Rea Tarea'))
    ).toBe(true);
    expect(
      tareasRes.body.data.some((t) => t.descripcion.includes('Eq Tarea'))
    ).toBe(true);
    expect(
      tareasRes.body.data.some((t) =>
        t.descripcion.includes('Configurar laboratorio')
      )
    ).toBe(true);

    // Toggle completada
    const tarea = tareasRes.body.data[0];
    const toggleRes = await request(app)
      .put(`/api/pedidos/${pedidoId}/tareas/${tarea.id}`)
      .set(authHeader(user));
    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.data.completada).toBe(true);

    // Verificar que al finalizar se marcan todas como completadas
    await request(app)
      .put(`/api/pedidos/${pedidoId}/finalizar`)
      .set(authHeader(user))
      .send({ usuarioId: user.id });
    const tareasFinal = await request(app)
      .get(`/api/pedidos/${pedidoId}/tareas`)
      .set(authHeader(user));
    expect(tareasFinal.body.data.every((t) => t.completada)).toBe(true);
  });

  it('debería rechazar si un equipo ya está reservado en el mismo horario', async () => {
    const user = await db.Usuario.create({
      nombre: 'Reserva',
      apellido: 'Test',
      email: `reserva-${Date.now()}@test.com`,
      password: '123',
      rol: 'Profesor',
    });
    const eq = await db.Equipment.create({
      name: 'Eq Reserva',
      status: 'Disponible',
      is_movable: true,
    });
    const lab = await db.Laboratorio.findOne();
    if (!lab) return;

    // Primer pedido con el equipo
    const res1 = await request(app)
      .post('/api/pedidos')
      .set(authHeader(user))
      .send({
        fecha: '2026-10-01',
        horaInicio: '08:00',
        horaFin: '10:00',
        laboratorioId: lab.id,
        cantidadAlumnos: 5,
        usuarioId: user.id,
        equipos: [eq.id],
      });
    expect(res1.status).toBe(201);
    // Aprobar primer pedido
    await request(app)
      .put(`/api/pedidos/${res1.body.data.id}/aprobar`)
      .set(authHeader(user));

    // Segundo pedido con mismo equipo en horario solapado
    const lab2 = await db.Laboratorio.create({
      nombre: 'Lab2',
      capacidad: 30,
      edificio: 'B',
    });
    const res2 = await request(app)
      .post('/api/pedidos')
      .set(authHeader(user))
      .send({
        fecha: '2026-10-01',
        horaInicio: '09:00',
        horaFin: '11:00',
        laboratorioId: lab2.id,
        cantidadAlumnos: 5,
        usuarioId: user.id,
        equipos: [eq.id],
      });
    expect(res2.status).toBe(201);
    expect(
      res2.body.warnings.some((w) => w.includes('ya está reservado'))
    ).toBe(true);
  });
});
