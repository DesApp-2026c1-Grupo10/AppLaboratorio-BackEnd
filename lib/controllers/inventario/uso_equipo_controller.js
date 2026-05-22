import db from '../../models';

const { UsoEquipo, Equipment, Pedido } = db;

export const getAll = async (req, res) => {
  const { equipoId } = req.query;
  const where = {};
  if (equipoId) where.equipoId = equipoId;

  const usos = await UsoEquipo.findAll({
    where,
    include: [
      { model: Equipment, as: 'equipo', attributes: ['id', 'name'] },
      {
        model: Pedido,
        as: 'pedido',
        attributes: ['id', 'fecha', 'descripcion'],
      },
    ],
    order: [['fechaInicio', 'DESC']],
  });
  res.json({ data: usos });
};

export const getById = async (req, res) => {
  const uso = await UsoEquipo.findByPk(req.params.id, {
    include: [
      { model: Equipment, as: 'equipo' },
      { model: Pedido, as: 'pedido' },
    ],
  });
  if (!uso) {
    return res.status(404).json({ message: 'Uso de equipo no encontrado' });
  }
  res.json({ data: uso });
};

export const create = async (req, res) => {
  const { equipoId, pedidoId, fechaInicio, fechaFin, observaciones } = req.body;

  if (!equipoId) {
    return res.status(400).json({ message: 'El equipo es obligatorio' });
  }
  if (!fechaInicio) {
    return res
      .status(400)
      .json({ message: 'La fecha de inicio es obligatoria' });
  }

  const equipo = await Equipment.findByPk(equipoId);
  if (!equipo) {
    return res.status(404).json({ message: 'Equipo no encontrado' });
  }

  const uso = await UsoEquipo.create({
    equipoId,
    pedidoId: pedidoId || null,
    fechaInicio,
    fechaFin: fechaFin || null,
    observaciones: observaciones || null,
  });

  // Actualizar estado del equipo a "En uso"
  await equipo.update({ status: 'En uso' });

  res.status(201).json({ data: uso });
};

export const finalizar = async (req, res) => {
  const uso = await UsoEquipo.findByPk(req.params.id);
  if (!uso) {
    return res.status(404).json({ message: 'Uso de equipo no encontrado' });
  }
  if (uso.fechaFin) {
    return res.status(400).json({ message: 'Este uso ya fue finalizado' });
  }

  await uso.update({ fechaFin: new Date() });

  const equipo = await Equipment.findByPk(uso.equipoId);
  if (equipo) {
    await equipo.update({ status: 'Disponible' });
  }

  res.json({ data: uso });
};

export const remove = async (req, res) => {
  const uso = await UsoEquipo.findByPk(req.params.id);
  if (!uso) {
    return res.status(404).json({ message: 'Uso de equipo no encontrado' });
  }
  await uso.destroy();
  res.status(204).send();
};
