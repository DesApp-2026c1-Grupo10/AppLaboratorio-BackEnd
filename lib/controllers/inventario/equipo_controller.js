import db from '../../models';

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
  const equipo = await Equipment.create({
    name,
    descripcion,
    status: estadoFinal,
    is_movable: is_movable || false,
    bld_id: bld_id || null,
    laboratorioId: laboratorioId || null,
    ultimaRevision: ultimaRevision || null,
    observaciones: observaciones || null,
  });
  res.status(201).json({ data: equipo });
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
  res.json({ data: equipo });
};

export const remove = async (req, res) => {
  const equipo = await Equipment.findByPk(req.params.id);
  if (!equipo) {
    return res.status(404).json({ message: 'Equipo no encontrado' });
  }
  await equipo.destroy();
  res.status(204).send();
};
