import request from 'supertest';
import { cleanDb } from '../../test/db_utils';
import app from '../app';
import Usuario from '../models/usuario';
import { authHeader } from '../../test/auth';

describe('Usuario controller', () => {
  let auth;

  beforeAll(async () => {
    await cleanDb();

    const usuarios = await Usuario.bulkCreate([
      {
        nombre: 'Pepita',
        apellido: 'La pistolera',
        email: 'pepita@universidad.edu',
        password: '123456',
      },
      {
        nombre: 'Juana',
        apellido: 'Azurduy',
        email: 'juana@universidad.edu',
        password: '123456',
      },
    ]);
    auth = authHeader(usuarios[0]);
  });
  describe('/usuarios', () => {
    let response;

    beforeAll(async () => {
      response = await request(app).get('/api/usuarios').set(auth);
    });

    it('devuelve código 200', () => {
      expect(response.statusCode).toBe(200);
    });

    it('devuelve la lista de usuarios', () => {
      // Usamos toMatchObject y no toEquals para que solo mire los atributos que especificamos.
      expect(response.body).toMatchObject({
        data: [
          { nombre: 'Pepita', apellido: 'La pistolera' },
          { nombre: 'Juana', apellido: 'Azurduy' },
        ],
      });
    });
  });
});
