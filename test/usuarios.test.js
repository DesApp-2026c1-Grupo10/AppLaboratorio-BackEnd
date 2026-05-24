import request from 'supertest';
import app from '../lib/app.js';
import { cleanDb } from './db_utils.js';
import { createUser } from './factories.js';

describe('Usuarios API', () => {
  beforeEach(async () => {
    await cleanDb();
  });

  test('login válido devuelve datos sin contraseña', async () => {
    const user = await createUser({
      nombre: 'Login',
      apellido: 'Test',
      email: 'login.test@universidad.edu',
      password: 'abc123',
    });

    const res = await request(app)
      .post('/api/usuarios/login')
      .send({ email: 'login.test@universidad.edu', password: 'abc123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toMatchObject({
      id: user.id,
      nombre: 'Login',
      apellido: 'Test',
      email: 'login.test@universidad.edu',
    });
    expect(res.body.data.password).toBeUndefined();
  });

  test('login inválido devuelve 401', async () => {
    await createUser({
      email: 'login.fail@universidad.edu',
      password: 'x12345',
    });

    const res = await request(app)
      .post('/api/usuarios/login')
      .send({ email: 'login.fail@universidad.edu', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Credenciales inválidas');
  });
});
