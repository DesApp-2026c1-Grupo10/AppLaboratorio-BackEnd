import db from '../../models';

const { Material, Laboratorio, MovimientoStock } = db;

export const getAll = async (req, res) => {
  const { search, page: pageRaw, limit: limitRaw } = req.query;
  const where = {};
  if (search) {
    where[db.Sequelize.Op.or] = [
      { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      { descripcion: { [db.Sequelize.Op.iLike]: `%${search}%` } },
    ];
  }
  if (pageRaw) {
    const page = parseInt(pageRaw) || 1;
    const limit = parseInt(limitRaw) || 25;
    const offset = (page - 1) * limit;
    const { count, rows } = await Material.findAndCountAll({
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
  const materiales = await Material.findAll({
    where,
    include: [{ model: Laboratorio, as: 'laboratorio' }],
    order: [['name', 'ASC']],
  });
  res.json({ data: materiales });
};

export const getById = async (req, res) => {
  const material = await Material.findByPk(req.params.id, {
    include: [
      { model: Laboratorio, as: 'laboratorio' },
      { model: MovimientoStock, as: 'movimientos' },
    ],
  });
  if (!material) {
    return res.status(404).json({ message: 'Material no encontrado' });
  }
  res.json({ data: material });
};

export const create = async (req, res) => {
  const {
    name,
    descripcion,
    stock,
    stockMinimo,
    unit,
    laboratorioId,
  } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }
  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ message: 'El stock no puede ser negativo' });
  }
  const material = await Material.create({
    name,
    descripcion,
    stock: stock || 0,
    stockMinimo: stockMinimo || 0,
    unit,
    laboratorioId: laboratorioId || null,
  });
  res.status(201).json({ data: material });
};

export const update = async (req, res) => {
  const material = await Material.findByPk(req.params.id);
  if (!material) {
    return res.status(404).json({ message: 'Material no encontrado' });
  }
  const {
    name,
    descripcion,
    stock,
    stockMinimo,
    unit,
    laboratorioId,
  } = req.body;
  if (name !== undefined && name.trim() === '') {
    return res.status(400).json({ message: 'El nombre no puede estar vacío' });
  }
  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ message: 'El stock no puede ser negativo' });
  }
  await material.update({
    name: name !== undefined ? name : material.name,
    descripcion: descripcion !== undefined ? descripcion : material.descripcion,
    stock: stock !== undefined ? stock : material.stock,
    stockMinimo: stockMinimo !== undefined ? stockMinimo : material.stockMinimo,
    unit: unit !== undefined ? unit : material.unit,
    laboratorioId:
      laboratorioId !== undefined ? laboratorioId : material.laboratorioId,
  });
  res.json({ data: material });
};

export const remove = async (req, res) => {
  const material = await Material.findByPk(req.params.id);
  if (!material) {
    return res.status(404).json({ message: 'Material no encontrado' });
  }
  await material.destroy();
  res.status(204).send();
};
