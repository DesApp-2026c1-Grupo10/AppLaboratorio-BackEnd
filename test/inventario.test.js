import request from 'supertest';
import app from '../lib/app';
import db from '../lib/models';
import { authHeader } from './auth.js';
import { createUser } from './factories.js';

let auth;

function api() {
  const req = request(app);
  const verbs = {};
  for (const verb of ['get', 'post', 'put', 'delete', 'patch']) {
    verbs[verb] = (url) => req[verb](url).set(auth);
  }
  return { ...verbs };
}

beforeAll(async () => {
  await db.sequelize.authenticate();
  const user = await createUser({ rol: 'Desarrollador' });
  auth = authHeader(user);
});

describe('GET /api/inventario/materiales', () => {
  it('debería devolver un array de materiales', async () => {
    const res = await api().get('/api/inventario/materiales');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('POST /api/inventario/materiales', () => {
  it('debería crear un material con datos válidos', async () => {
    const res = await api().post('/api/inventario/materiales').send({
      name: 'Material Test',
      stock: 100,
      stockMinimo: 10,
      unit: 'unidades',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Material Test');
  });

  it('debería rechazar material sin nombre', async () => {
    const res = await api()
      .post('/api/inventario/materiales')
      .send({ stock: 100 });
    expect(res.status).toBe(400);
  });

  it('debería rechazar stock negativo', async () => {
    const res = await api()
      .post('/api/inventario/materiales')
      .send({ name: 'Test', stock: -5 });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/inventario/reactivos', () => {
  it('debería crear un reactivo con datos válidos', async () => {
    const res = await api()
      .post('/api/inventario/reactivos')
      .send({ name: 'Reactivo Test', stock: 500, unidadMedida: 'ml' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Reactivo Test');
  });

  it('debería rechazar reactivo sin nombre', async () => {
    const res = await api()
      .post('/api/inventario/reactivos')
      .send({ stock: 100 });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/inventario/equipos', () => {
  it('debería crear un equipo con datos válidos', async () => {
    const res = await api()
      .post('/api/inventario/equipos')
      .send({ name: 'Equipo Test', status: 'Disponible' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Equipo Test');
  });

  it('debería rechazar equipo sin nombre', async () => {
    const res = await api()
      .post('/api/inventario/equipos')
      .send({ status: 'Disponible' });
    expect(res.status).toBe(400);
  });

  it('debería rechazar estado inválido', async () => {
    const res = await api()
      .post('/api/inventario/equipos')
      .send({ name: 'Test', status: 'Inexistente' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/inventario/movimientos', () => {
  it('debería rechazar movimiento sin material ni reactivo', async () => {
    const res = await api()
      .post('/api/inventario/movimientos')
      .send({ tipoMovimiento: 'entrada', cantidad: 10, usuarioId: 1 });
    expect(res.status).toBe(400);
  });

  it('debería rechazar tipo inválido', async () => {
    const res = await api().post('/api/inventario/movimientos').send({
      tipoMovimiento: 'invalido',
      cantidad: 10,
      materialId: 1,
      usuarioId: 1,
    });
    expect(res.status).toBe(400);
  });

  it('debería rechazar cantidad menor a 1', async () => {
    const res = await api().post('/api/inventario/movimientos').send({
      tipoMovimiento: 'entrada',
      cantidad: 0,
      materialId: 1,
      usuarioId: 1,
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/inventario/reactivos?proximoVencer=true', () => {
  it('debería filtrar reactivos próximos a vencer', async () => {
    const res = await api().get('/api/inventario/reactivos?proximoVencer=true');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Sustancias Básicas CRUD', () => {
  const basePath = '/api/inventario/sustancias-basicas';

  it('debería crear una sustancia básica', async () => {
    const res = await api().post(basePath).send({
      name: 'Ácido Sulfúrico',
      stock: 100,
      stockMinimo: 10,
      unidadMedida: 'litros',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Ácido Sulfúrico');
  });

  it('debería rechazar sustancia sin nombre', async () => {
    const res = await api().post(basePath).send({ stock: 50 });
    expect(res.status).toBe(400);
  });

  it('debería listar sustancias básicas', async () => {
    const res = await api().get(basePath);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('debería actualizar una sustancia básica', async () => {
    const created = await api().post(basePath).send({
      name: 'Sustancia Update',
      stock: 50,
    });
    const id = created.body.data.id;
    const res = await api().put(`${basePath}/${id}`).send({ stock: 80 });
    expect(res.status).toBe(200);
    expect(res.body.data.stock).toBe(80);
  });

  it('debería eliminar una sustancia básica', async () => {
    const created = await api().post(basePath).send({
      name: 'Sustancia Delete',
      stock: 10,
    });
    const id = created.body.data.id;
    const res = await api().delete(`${basePath}/${id}`);
    expect(res.status).toBe(204);
  });
});

describe('Actividades Predefinidas CRUD', () => {
  const basePath = '/api/actividades-predefinidas';
  let lab;
  let user;

  beforeAll(async () => {
    lab = await db.Laboratorio.create({
      nombre: 'Lab Act Test',
      capacidad: 30,
      edificio: 'A',
    });
    user = await db.Usuario.create({
      nombre: 'Act',
      apellido: 'Test',
      email: `act-${Date.now()}@test.com`,
      password: '123',
      rol: 'Profesor',
    });
  });

  it('debería crear una actividad predefinida', async () => {
    const res = await api()
      .post(basePath)
      .send({
        nombre: 'Práctica de Ácidos',
        laboratorioId: lab.id,
        horaInicio: '08:00',
        horaFin: '10:00',
        cantidadAlumnos: 20,
        usuarioId: user.id,
        config: { materiales: [{ id: 1, cantidad: 5 }] },
      });
    expect(res.status).toBe(201);
    expect(res.body.data.nombre).toBe('Práctica de Ácidos');
  });

  it('debería listar actividades predefinidas', async () => {
    const res = await api().get(basePath);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('debería actualizar una actividad predefinida', async () => {
    const created = await api().post(basePath).send({
      nombre: 'Actividad Update',
      laboratorioId: lab.id,
      horaInicio: '08:00',
      horaFin: '10:00',
      cantidadAlumnos: 15,
      usuarioId: user.id,
    });
    const id = created.body.data.id;
    const res = await api()
      .put(`${basePath}/${id}`)
      .send({ cantidadAlumnos: 25 });
    expect(res.status).toBe(200);
    expect(res.body.data.cantidadAlumnos).toBe(25);
  });

  it('debería eliminar una actividad predefinida', async () => {
    const created = await api().post(basePath).send({
      nombre: 'Actividad Delete',
      laboratorioId: lab.id,
      horaInicio: '08:00',
      horaFin: '10:00',
      cantidadAlumnos: 10,
      usuarioId: user.id,
    });
    const id = created.body.data.id;
    const res = await api().delete(`${basePath}/${id}`);
    expect(res.status).toBe(204);
  });
});
