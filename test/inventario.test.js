import request from 'supertest';
import app from '../lib/app';
import db from '../lib/models';

beforeAll(async () => {
  // Asegurar conexión a BD de test
  await db.sequelize.authenticate();
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('GET /api/inventario/materiales', () => {
  it('debería devolver un array de materiales', async () => {
    const res = await request(app).get('/api/inventario/materiales');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('POST /api/inventario/materiales', () => {
  it('debería crear un material con datos válidos', async () => {
    const res = await request(app)
      .post('/api/inventario/materiales')
      .send({
        name: 'Material Test',
        stock: 100,
        stockMinimo: 10,
        unit: 'unidades',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Material Test');
  });

  it('debería rechazar material sin nombre', async () => {
    const res = await request(app)
      .post('/api/inventario/materiales')
      .send({ stock: 100 });
    expect(res.status).toBe(400);
  });

  it('debería rechazar stock negativo', async () => {
    const res = await request(app)
      .post('/api/inventario/materiales')
      .send({ name: 'Test', stock: -5 });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/inventario/reactivos', () => {
  it('debería crear un reactivo con datos válidos', async () => {
    const res = await request(app)
      .post('/api/inventario/reactivos')
      .send({ name: 'Reactivo Test', stock: 500, unidadMedida: 'ml' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Reactivo Test');
  });

  it('debería rechazar reactivo sin nombre', async () => {
    const res = await request(app)
      .post('/api/inventario/reactivos')
      .send({ stock: 100 });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/inventario/equipos', () => {
  it('debería crear un equipo con datos válidos', async () => {
    const res = await request(app)
      .post('/api/inventario/equipos')
      .send({ name: 'Equipo Test', status: 'Disponible' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Equipo Test');
  });

  it('debería rechazar equipo sin nombre', async () => {
    const res = await request(app)
      .post('/api/inventario/equipos')
      .send({ status: 'Disponible' });
    expect(res.status).toBe(400);
  });

  it('debería rechazar estado inválido', async () => {
    const res = await request(app)
      .post('/api/inventario/equipos')
      .send({ name: 'Test', status: 'Inexistente' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/inventario/movimientos', () => {
  it('debería rechazar movimiento sin material ni reactivo', async () => {
    const res = await request(app)
      .post('/api/inventario/movimientos')
      .send({ tipoMovimiento: 'entrada', cantidad: 10, usuarioId: 1 });
    expect(res.status).toBe(400);
  });

  it('debería rechazar tipo inválido', async () => {
    const res = await request(app)
      .post('/api/inventario/movimientos')
      .send({
        tipoMovimiento: 'invalido',
        cantidad: 10,
        materialId: 1,
        usuarioId: 1,
      });
    expect(res.status).toBe(400);
  });

  it('debería rechazar cantidad menor a 1', async () => {
    const res = await request(app)
      .post('/api/inventario/movimientos')
      .send({
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
    const res = await request(app).get(
      '/api/inventario/reactivos?proximoVencer=true'
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
