import request from 'supertest';
import app from '../lib/app.js';
import db from '../lib/models';
import { cleanDb } from './db_utils.js';
import {
  createUser,
  createLaboratorio,
  createMaterial,
  createReactivo,
  createEquipo,
  createPedido,
} from './factories.js';

let user;
let laboratorio;
let material;
let reactivo;
let equipo;

beforeEach(async () => {
  await cleanDb();
  console.log('DB test name:', db.sequelize.config.database);
  console.log(
    'Existing tables:',
    await db.sequelize.getQueryInterface().showAllTables()
  );
  console.log(
    'PedidoReactivo attributes',
    Object.keys(db.PedidoReactivo.rawAttributes)
  );
  console.log('PedidoReactivo options id:', db.PedidoReactivo.options.id);
  console.log(
    'PedidoReactivo primary keys:',
    db.PedidoReactivo.primaryKeyAttributes
  );
  user = await createUser({ email: 'pedido.user@universidad.edu' });
  laboratorio = await createLaboratorio();
  material = await createMaterial({ name: 'Tubos de ensayo', stock: 100 });
  reactivo = await createReactivo({ name: 'Ácido nítrico', stock: 50 });
  equipo = await createEquipo();
});

describe('Pedidos API', () => {
  test('crea un pedido válido', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .send({
        fecha: '2026-06-01',
        horaInicio: '08:00',
        horaFin: '10:00',
        laboratorioId: laboratorio.id,
        cantidadAlumnos: 10,
        usuarioId: user.id,
        equipos: [equipo.id],
        materiales: [{ id: material.id, cantidad: 5 }],
        reactivos: [{ id: reactivo.id, cantidad: 2 }],
      });

    if (res.statusCode !== 201) {
      console.error('PEDIDO CREATE ERROR', res.body);
    }

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toMatchObject({
      estado: 'Pendiente',
      cantidadAlumnos: 10,
    });
  });

  test('aprueba un pedido y registra la acción', async () => {
    const pedido = await createPedido({
      user,
      laboratorio,
      equipos: [equipo],
      materiales: [{ id: material.id, cantidad: 5 }],
      reactivos: [{ id: reactivo.id, cantidad: 2 }],
    });

    const res = await request(app)
      .post(`/api/pedidos/${pedido.id}/aprobar`)
      .send({ usuarioId: user.id });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toMatchObject({ estado: 'Aprobado' });

    const history = await request(app).get(
      `/api/pedidos/${pedido.id}/historial`
    );
    expect(history.statusCode).toBe(200);
    expect(history.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ tipo: 'APROBACION' })])
    );
  });

  test('finaliza un pedido aprobado y actualiza stock y estado', async () => {
    const pedido = await createPedido({
      user,
      laboratorio,
      equipos: [equipo],
      materiales: [{ id: material.id, cantidad: 5 }],
      reactivos: [{ id: reactivo.id, cantidad: 2 }],
    });

    await request(app)
      .post(`/api/pedidos/${pedido.id}/aprobar`)
      .send({ usuarioId: user.id });

    const res = await request(app)
      .post(`/api/pedidos/${pedido.id}/finalizar`)
      .send({
        usuarioId: user.id,
        materialesUsados: [
          { materialId: material.id, cantidad: 5, motivo: 'Clase' },
        ],
        reactivosUsados: [
          { reagentId: reactivo.id, cantidad: 2, motivo: 'Prueba' },
        ],
        equiposDañados: [{ equipmentId: equipo.id, descripcion: 'Pieza rota' }],
      });

    if (res.statusCode !== 200) {
      console.error('FINALIZAR ERROR:', res.body);
    }

    expect(res.statusCode).toBe(200);
    expect(res.body.data.estado).toBe('Finalizado');
    expect(res.body.message).toContain('Clase finalizada');

    const updatedMaterial = await material.reload();
    const updatedReactivo = await reactivo.reload();
    const updatedEquipo = await equipo.reload();

    expect(updatedMaterial.stock).toBe(95);
    expect(updatedReactivo.stock).toBe(48);
    expect(updatedEquipo.status).toBe('MAINTENANCE');
  });
});
