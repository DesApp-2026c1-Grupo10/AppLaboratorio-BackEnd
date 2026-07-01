import db from '../models';
import { broadcast } from '../websocket';

const {
  PedidoRevision,
  Pedido,
  Usuario,
  ModificacionPedido,
  PedidoMaterial,
  PedidoReactivo,
  PedidoEquipo,
} = db;

// Dev propone cambios
export const create = async (req, res) => {
  const { comentario, cambios, usuarioId } = req.body;
  const pedido = await Pedido.findByPk(req.params.id);
  if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

  const esMensaje = !cambios || Object.keys(cambios).length === 0;
  const estado = esMensaje ? 'mensaje' : 'pendiente';

  const revision = await PedidoRevision.create({
    pedidoId: pedido.id,
    usuarioId,
    comentario,
    cambios: cambios || {},
    estado,
  });

  if (!esMensaje) {
    await ModificacionPedido.create({
      pedidoId: pedido.id,
      usuarioId,
      tipo: 'MODIFICACION',
      descripcion: `Revisión propuesta${comentario ? ': ' + comentario : ''}`,
    });
  }

  const full = await PedidoRevision.findByPk(revision.id, {
    include: [
      { model: Usuario, attributes: ['id', 'nombre', 'apellido', 'email'] },
    ],
  });

  res.status(201).json({ data: full.toJSON() });
  broadcast('REVISION_CREADA', {
    pedidoId: pedido.id,
    revision: full.toJSON(),
  });
};

// Listar revisiones de un pedido
export const list = async (req, res) => {
  const revisiones = await PedidoRevision.findAll({
    where: { pedidoId: req.params.id },
    include: [
      {
        model: Usuario,
        attributes: ['id', 'nombre', 'apellido', 'rol'],
        paranoid: false,
      },
    ],
    order: [['createdAt', 'ASC']],
  });
  res.json({ data: revisiones.map((r) => r.toJSON()) });
};

// Profesor acepta la revisión → aplica los cambios al pedido
export const accept = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const revision = await PedidoRevision.findByPk(req.params.revisionId, {
      include: [{ model: Pedido }],
    });
    if (!revision || revision.estado !== 'pendiente') {
      return res
        .status(400)
        .json({ message: 'Revisión no encontrada o ya fue procesada' });
    }

    const pedido = revision.Pedido;
    const cambios = revision.cambios || {};

    // Aplicar cambios al pedido
    const camposActualizables = [
      'fecha',
      'horaInicio',
      'horaFin',
      'laboratorioId',
      'cantidadAlumnos',
      'descripcion',
    ];
    const cambiosAplicados = {};
    for (const campo of camposActualizables) {
      if (cambios[campo] !== undefined && cambios[campo] !== null) {
        cambiosAplicados[campo] = {
          antes: pedido[campo],
          despues: cambios[campo],
        };
        pedido[campo] = cambios[campo];
      }
    }

    await pedido.save({ transaction: t });

    // Actualizar materiales/reactivos/equipos si vienen en cambios
    if (cambios.materiales) {
      await PedidoMaterial.destroy({
        where: { pedidoId: pedido.id },
        transaction: t,
      });
      await PedidoMaterial.bulkCreate(
        cambios.materiales.map((m) => ({
          pedidoId: pedido.id,
          materialId: m.id,
          cantidad: m.cantidad ?? 1,
        })),
        { transaction: t }
      );
    }
    if (cambios.reactivos) {
      await PedidoReactivo.destroy({
        where: { pedidoId: pedido.id },
        transaction: t,
      });
      await PedidoReactivo.bulkCreate(
        cambios.reactivos.map((r) => ({
          pedidoId: pedido.id,
          reagentId: r.id,
          cantidad: r.cantidad ?? 1,
        })),
        { transaction: t }
      );
    }
    if (cambios.equipos) {
      const equiposIds = cambios.equipos.map((e) =>
        typeof e === 'number' ? e : e.id
      );
      await PedidoEquipo.destroy({
        where: { pedidoId: pedido.id },
        transaction: t,
      });
      await PedidoEquipo.bulkCreate(
        equiposIds.map((id) => ({ pedidoId: pedido.id, equipmentId: id })),
        { transaction: t }
      );
    }

    // Registrar en historial
    await ModificacionPedido.create(
      {
        pedidoId: pedido.id,
        usuarioId: req.body.usuarioId,
        tipo: 'MODIFICACION',
        cambios: cambiosAplicados,
        descripcion: `Cambios aceptados de revisión: ${
          revision.comentario || 'sin comentario'
        }`,
      },
      { transaction: t }
    );

    // Marcar revisión como aceptada
    await revision.update({ estado: 'aceptada' }, { transaction: t });

    await PedidoRevision.create(
      {
        pedidoId: pedido.id,
        usuarioId: req.body.usuarioId,
        estado: 'respuesta',
        comentario: 'Cambios aceptados',
        cambios: {},
      },
      { transaction: t }
    );

    await t.commit();

    const updated = await Pedido.findByPk(pedido.id, {
      include: [
        { model: db.Laboratorio },
        {
          model: db.Usuario,
          attributes: ['id', 'nombre', 'apellido'],
          paranoid: false,
        },
        { model: db.Equipment, as: 'Equipments', paranoid: false },
        { model: db.Material, as: 'materiales', paranoid: false },
        { model: db.Reagent, as: 'reactivos', paranoid: false },
      ],
    });
    res.json({ data: updated });
    broadcast('REVISION_ACEPTADA', {
      pedidoId: pedido.id,
      pedido: updated.toJSON(),
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Devuelve IDs de pedidos con revisiones (pendientes o procesadas)
export const getPedidosConPendientes = async (_req, res) => {
  const revisiones = await PedidoRevision.findAll({
    attributes: ['pedidoId', 'estado'],
  });
  const porPedido = new Map();
  for (const r of revisiones) {
    if (!porPedido.has(r.pedidoId)) {
      porPedido.set(r.pedidoId, { pendiente: false, procesada: false });
    }
    const info = porPedido.get(r.pedidoId);
    if (r.estado === 'pendiente') info.pendiente = true;
    else info.procesada = true;
  }
  res.json({ data: Object.fromEntries(porPedido) });
};

// Profesor rechaza la revisión
export const reject = async (req, res) => {
  const revision = await PedidoRevision.findByPk(req.params.revisionId);
  if (!revision || revision.estado !== 'pendiente') {
    return res
      .status(400)
      .json({ message: 'Revisión no encontrada o ya fue procesada' });
  }
  await revision.update({ estado: 'rechazada' });

  const respuesta = await PedidoRevision.create({
    pedidoId: revision.pedidoId,
    usuarioId: req.body.usuarioId,
    estado: 'respuesta',
    comentario: req.body.motivo || '',
    cambios: {},
  });

  await ModificacionPedido.create({
    pedidoId: revision.pedidoId,
    usuarioId: req.body.usuarioId,
    tipo: 'MODIFICACION',
    descripcion: `Revisión rechazada${
      req.body.motivo ? ': ' + req.body.motivo : ''
    }`,
  });

  const full = await PedidoRevision.findByPk(respuesta.id, {
    include: [
      { model: Usuario, attributes: ['id', 'nombre', 'apellido', 'email'] },
    ],
  });

  res.json({ data: full.toJSON() });
  broadcast('REVISION_RECHAZADA', {
    pedidoId: revision.pedidoId,
    revision: full.toJSON(),
  });
};
