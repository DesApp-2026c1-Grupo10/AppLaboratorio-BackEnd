import db from '../../models';
import { broadcast } from '../../websocket';

const { Equipment, Laboratorio, UsoEquipo } = db;

const ESTADOS_VALIDOS = [
  'Disponible',
  'En uso',
  'Mantenimiento',
  'Fuera de servicio',
];

export const getAll = async (req, res) => {
  const { search, estado, page: pageRaw, limit: limitRaw } = req.query;
  const where = {};
  if (search) {
    where[db.Sequelize.Op.or] = [
      { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      { descripcion: { [db.Sequelize.Op.iLike]: `%${search}%` } },
    ];
  }
  if (estado) {
    where.status = estado;
  }
  if (pageRaw) {
    const page = parseInt(pageRaw) || 1;
    const limit = parseInt(limitRaw) || 25;
    const offset = (page - 1) * limit;
    const { count, rows } = await Equipment.findAndCountAll({
      where,
      include: [{ model: Laboratorio, as: 'laboratorio' }],
      order: [['name', 'ASC']],
      limit,
      offset,
    });
    return res.json({
      data: rows,
      total: count,
      page,
      pages: Math.ceil(count / limit),
    });
  }
  const equipos = await Equipment.findAll({
    where,
    include: [{ model: Laboratorio, as: 'laboratorio' }],
    order: [['name', 'ASC']],
  });
  res.json({ data: equipos });
};

export const getById = async (req, res) => {
  const equipo = await Equipment.findByPk(req.params.id, {
    include: [
      { model: Laboratorio, as: 'laboratorio' },
      { model: UsoEquipo, as: 'usos' },
    ],
  });
  if (!equipo) {
    return res.status(404).json({ message: 'Equipo no encontrado' });
  }
  res.json({ data: equipo });
};

export const create = async (req, res) => {
  const {
    name,
    descripcion,
    status,
    is_movable,
    bld_id,
    laboratorioId,
    ultimaRevision,
    observaciones,
  } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }
  const estadoFinal = status || 'Disponible';
  if (!ESTADOS_VALIDOS.includes(estadoFinal)) {
    return res.status(400).json({
      message: `Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(', ')}`,
    });
  }
  let equipo = await Equipment.create({
    name,
    descripcion,
    status: estadoFinal,
    is_movable: is_movable || false,
    bld_id: bld_id || null,
    laboratorioId: laboratorioId || null,
    ultimaRevision: ultimaRevision || null,
    observaciones: observaciones || null,
  });
  equipo = await Equipment.findByPk(equipo.id, {
    include: [{ model: Laboratorio, as: 'laboratorio' }],
  });
  res.status(201).json({ data: equipo });
  broadcast('INVENTARIO_MODIFICADO', {
    tipo: 'equipo',
    accion: 'crear',
    data: equipo,
  });
};

export const update = async (req, res) => {
  const equipo = await Equipment.findByPk(req.params.id);
  if (!equipo) {
    return res.status(404).json({ message: 'Equipo no encontrado' });
  }
  const {
    name,
    descripcion,
    status,
    is_movable,
    bld_id,
    laboratorioId,
    ultimaRevision,
    observaciones,
  } = req.body;
  if (name !== undefined && name.trim() === '') {
    return res.status(400).json({ message: 'El nombre no puede estar vacío' });
  }
  if (status !== undefined && !ESTADOS_VALIDOS.includes(status)) {
    return res.status(400).json({
      message: `Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(', ')}`,
    });
  }
  await equipo.update({
    name: name !== undefined ? name : equipo.name,
    descripcion: descripcion !== undefined ? descripcion : equipo.descripcion,
    status: status !== undefined ? status : equipo.status,
    is_movable: is_movable !== undefined ? is_movable : equipo.is_movable,
    bld_id: bld_id !== undefined ? bld_id : equipo.bld_id,
    laboratorioId:
      laboratorioId !== undefined ? laboratorioId : equipo.laboratorioId,
    ultimaRevision:
      ultimaRevision !== undefined ? ultimaRevision : equipo.ultimaRevision,
    observaciones:
      observaciones !== undefined ? observaciones : equipo.observaciones,
  });
  const updated = await Equipment.findByPk(equipo.id, {
    include: [{ model: Laboratorio, as: 'laboratorio' }],
  });
  res.json({ data: updated });
  broadcast('INVENTARIO_MODIFICADO', {
    tipo: 'equipo',
    accion: 'editar',
    data: updated,
  });
};

export const remove = async (req, res) => {
  const equipo = await Equipment.findByPk(req.params.id);
  if (!equipo) {
    return res.status(404).json({ message: 'Equipo no encontrado' });
  }
  await equipo.destroy();
  broadcast('INVENTARIO_MODIFICADO', {
    tipo: 'equipo',
    accion: 'eliminar',
    data: { id: req.params.id },
  });
  res.status(204).send();
};

export const mover = async (req, res) => {
  const { id } = req.params;
  const { nuevoLaboratorioId } = req.body;
  if (!nuevoLaboratorioId) {
    return res
      .status(400)
      .json({ message: 'El laboratorio destino es obligatorio' });
  }
  const equipo = await Equipment.findByPk(id, {
    include: [{ model: Laboratorio, as: 'laboratorio' }],
  });
  if (!equipo) {
    return res.status(404).json({ message: 'Equipo no encontrado' });
  }
  const labDestino = await Laboratorio.findByPk(nuevoLaboratorioId);
  if (!labDestino) {
    return res
      .status(404)
      .json({ message: 'Laboratorio destino no encontrado' });
  }
  await equipo.update({ laboratorioId: nuevoLaboratorioId });
  const updated = await Equipment.findByPk(id, {
    include: [{ model: Laboratorio, as: 'laboratorio' }],
  });
  res.json({ data: updated });
  broadcast('INVENTARIO_MODIFICADO', {
    tipo: 'equipo',
    accion: 'mover',
    data: updated,
  });
};
