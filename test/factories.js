import db from '../lib/models';
import bcrypt from 'bcryptjs';

export async function createUser(overrides = {}) {
  const plainPassword = overrides.password || '123456';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  const data = { ...overrides };
  delete data.password;
  return db.Usuario.create({
    nombre: 'Usuario',
    apellido: 'Prueba',
    email: `user-${Date.now()}@universidad.edu`,
    password: hashedPassword,
    rol: 'Profesor',
    ...data,
  });
}

export async function createLaboratorio(overrides = {}) {
  return db.Laboratorio.create({
    nombre: 'Laboratorio Test',
    capacidad: 30,
    edificio: 'Edificio A',
    ...overrides,
  });
}

export async function createMaterial(overrides = {}) {
  return db.Material.create({
    name: 'Material Test',
    stock: 100,
    unit: 'unidad',
    ...overrides,
  });
}

export async function createReactivo(overrides = {}) {
  return db.Reagent.create({
    name: 'Reactivo Test',
    stock: 50,
    prep_time: 0,
    ...overrides,
  });
}

export async function createEquipo(overrides = {}) {
  return db.Equipment.create({
    name: 'Equipo Test',
    bld_id: 1,
    status: 'Disponible',
    is_movable: true,
    ...overrides,
  });
}

export async function createPedido({
  user,
  laboratorio,
  equipos = [],
  materiales = [],
  reactivos = [],
  overrides = {},
}) {
  const pedido = await db.Pedido.create({
    fecha: '2026-06-01',
    horaInicio: '10:00',
    horaFin: '12:00',
    cantidadAlumnos: 10,
    usuarioId: user.id,
    laboratorioId: laboratorio.id,
    estado: 'Pendiente',
    ...overrides,
  });

  for (const eq of equipos) {
    await db.PedidoEquipo.create({
      pedidoId: pedido.id,
      equipmentId: eq.id,
    });
  }

  for (const m of materiales) {
    await db.PedidoMaterial.create({
      pedidoId: pedido.id,
      materialId: m.id,
      cantidad: m.cantidad || 1,
    });
  }

  for (const r of reactivos) {
    await db.PedidoReactivo.create({
      pedidoId: pedido.id,
      reagentId: r.id,
      cantidad: r.cantidad || 1,
    });
  }

  return pedido;
}
