import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import config from './lib/config/config.js';

const cfg = config.default || config;
const seq = new Sequelize(cfg.db.database, cfg.db.username, cfg.db.password, {
  host: cfg.db.host,
  port: cfg.db.port,
  dialect: cfg.db.dialect,
  logging: false,
});

const hash = bcrypt.hashSync('123456', 10);
const hash123 = bcrypt.hashSync('123', 10);

await seq.query(
  `UPDATE "Usuarios" SET "password"='${hash}' WHERE "email" IN ('juana.azurduy@universidad.edu','jose.artigas@universidad.edu','simon.bolivar@universidad.edu')`
);

const [existing] = await seq.query(
  `SELECT id FROM "Usuarios" WHERE "email"='desarrollador@test.com'`
);

if (existing.length === 0) {
  await seq.query(
    `INSERT INTO "Usuarios" ("nombre","apellido","email","password","rol","fechaNacimiento","createdAt","updatedAt") VALUES ('Desarrollador','Test','desarrollador@test.com','${hash123}','Profesor','1990-01-01',NOW(),NOW())`
  );
  console.log('Usuario desarrollador@test.com creado');
} else {
  await seq.query(
    `UPDATE "Usuarios" SET "password"='${hash123}' WHERE "email"='desarrollador@test.com'`
  );
  console.log('Password de desarrollador@test.com actualizada');
}

console.log('Contraseñas actualizadas con bcrypt OK');
await seq.close();
