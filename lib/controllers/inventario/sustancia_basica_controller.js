import db from '../../models';

const { SustanciaBasica } = db;

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
    const { count, rows } = await SustanciaBasica.findAndCountAll({
      where,
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
  const sustancias = await SustanciaBasica.findAll({
    where,
    order: [['name', 'ASC']],
  });
  res.json({ data: sustancias });
};

export const getById = async (req, res) => {
  const sustancia = await SustanciaBasica.findByPk(req.params.id);
  if (!sustancia) {
    return res.status(404).json({ message: 'Sustancia básica no encontrada' });
  }
  res.json({ data: sustancia });
};

export const create = async (req, res) => {
  const { name, descripcion, stock, stockMinimo, unidadMedida } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }
  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ message: 'El stock no puede ser negativo' });
  }
  const sustancia = await SustanciaBasica.create({
    name,
    descripcion,
    stock: stock || 0,
    stockMinimo: stockMinimo || 0,
    unidadMedida,
  });
  res.status(201).json({ data: sustancia });
};

export const update = async (req, res) => {
  const sustancia = await SustanciaBasica.findByPk(req.params.id);
  if (!sustancia) {
    return res.status(404).json({ message: 'Sustancia básica no encontrada' });
  }
  const { name, descripcion, stock, stockMinimo, unidadMedida } = req.body;
  if (name !== undefined && name.trim() === '') {
    return res.status(400).json({ message: 'El nombre no puede estar vacío' });
  }
  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ message: 'El stock no puede ser negativo' });
  }
  await sustancia.update({
    name: name !== undefined ? name : sustancia.name,
    descripcion:
      descripcion !== undefined ? descripcion : sustancia.descripcion,
    stock: stock !== undefined ? stock : sustancia.stock,
    stockMinimo:
      stockMinimo !== undefined ? stockMinimo : sustancia.stockMinimo,
    unidadMedida:
      unidadMedida !== undefined ? unidadMedida : sustancia.unidadMedida,
  });
  res.json({ data: sustancia });
};

export const remove = async (req, res) => {
  const sustancia = await SustanciaBasica.findByPk(req.params.id);
  if (!sustancia) {
    return res.status(404).json({ message: 'Sustancia básica no encontrada' });
  }
  await sustancia.destroy();
  res.status(204).send();
};
