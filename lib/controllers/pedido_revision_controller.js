import db from '../models';

const { PedidoRevision, Pedido, Usuario, ModificacionPedido } = db;

// Dev propone cambios
export const create = async (req, res) => {
  const { comentario, cambios } = req.body;
  const pedido = await Pedido.findByPk(req.params.id);
  if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

  const revision = await PedidoRevision.create({
    pedidoId: pedido.id,
    usuarioId: req.body.usuarioId,
    comentario,
    cambios,
    estado: 'pendiente',
  });

  res.status(201).json({ data: revision.toJSON() });
};

// Listar revisiones de un pedido
export const list = async (req, res) => {
  const revisiones = await PedidoRevision.findAll({
    where: { pedidoId: req.params.id },
    include: [
      { model: Usuario, attributes: ['id', 'nombre', 'apellido', 'rol'] },
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
      await pedido.setMateriales(cambios.materiales, { transaction: t });
    }
    if (cambios.reactivos) {
      await pedido.setReactivos(cambios.reactivos, { transaction: t });
    }
    if (cambios.equipos) {
      await pedido.setEquipments(cambios.equipos, { transaction: t });
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

    await t.commit();

    const updated = await Pedido.findByPk(pedido.id, {
      include: [
        { model: db.Laboratorio },
        { model: db.Usuario, attributes: ['id', 'nombre', 'apellido'] },
        { model: db.Equipment, as: 'Equipments' },
        { model: db.Material, as: 'materiales' },
        { model: db.Reagent, as: 'reactivos' },
      ],
    });
    res.json({ data: updated });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Profesor rechaza la revisión
export const reject = async (req, res) => {
  const revision = await PedidoRevision.findByPk(req.params.revisionId);
  if (!revision || revision.estado !== 'pendiente') {
    return res
      .status(400)
      .json({ message: 'Revisión no encontrada o ya fue procesada' });
  }
  await revision.update({
    estado: 'rechazada',
    comentario: req.body.motivo
      ? `${revision.comentario || ''}\n\nMotivo de rechazo: ${req.body.motivo}`
      : revision.comentario,
  });
  res.json({ data: revision.toJSON() });
};
