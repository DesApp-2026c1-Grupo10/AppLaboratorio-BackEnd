import db from '../../models';

const { Reagent, Laboratorio, MovimientoStock } = db;

export const getAll = async (req, res) => {
  const { search, proximoVencer } = req.query;
  const where = {};
  if (search) {
    where[db.Sequelize.Op.or] = [
      { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      { descripcion: { [db.Sequelize.Op.iLike]: `%${search}%` } },
    ];
  }
  if (proximoVencer === 'true') {
    const treintaDias = new Date();
    treintaDias.setDate(treintaDias.getDate() + 30);
    where.vencimiento = {
      [db.Sequelize.Op.and]: [
        { [db.Sequelize.Op.ne]: null },
        { [db.Sequelize.Op.lte]: treintaDias },
      ],
    };
  }
  const reactivos = await Reagent.findAll({
    where,
    include: [{ model: Laboratorio, as: 'laboratorio' }],
    order: [['name', 'ASC']],
  });
  res.json({ data: reactivos });
};

export const getById = async (req, res) => {
  const reactivo = await Reagent.findByPk(req.params.id, {
    include: [
      { model: Laboratorio, as: 'laboratorio' },
      { model: MovimientoStock, as: 'movimientos' },
    ],
  });
  if (!reactivo) {
    return res.status(404).json({ message: 'Reactivo no encontrado' });
  }
  res.json({ data: reactivo });
};

export const create = async (req, res) => {
  const {
    name,
    descripcion,
    stock,
    unidadMedida,
    vencimiento,
    prep_time,
    laboratorioId,
  } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }
  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ message: 'El stock no puede ser negativo' });
  }
  const reactivo = await Reagent.create({
    name,
    descripcion,
    stock: stock || 0,
    unidadMedida,
    vencimiento: vencimiento || null,
    prep_time: prep_time || 0,
    laboratorioId: laboratorioId || null,
  });
  res.status(201).json({ data: reactivo });
};

export const update = async (req, res) => {
  const reactivo = await Reagent.findByPk(req.params.id);
  if (!reactivo) {
    return res.status(404).json({ message: 'Reactivo no encontrado' });
  }
  const {
    name,
    descripcion,
    stock,
    unidadMedida,
    vencimiento,
    prep_time,
    laboratorioId,
  } = req.body;
  if (name !== undefined && name.trim() === '') {
    return res.status(400).json({ message: 'El nombre no puede estar vacío' });
  }
  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ message: 'El stock no puede ser negativo' });
  }
  await reactivo.update({
    name: name !== undefined ? name : reactivo.name,
    descripcion: descripcion !== undefined ? descripcion : reactivo.descripcion,
    stock: stock !== undefined ? stock : reactivo.stock,
    unidadMedida:
      unidadMedida !== undefined ? unidadMedida : reactivo.unidadMedida,
    vencimiento: vencimiento !== undefined ? vencimiento : reactivo.vencimiento,
    prep_time: prep_time !== undefined ? prep_time : reactivo.prep_time,
    laboratorioId:
      laboratorioId !== undefined ? laboratorioId : reactivo.laboratorioId,
  });
  res.json({ data: reactivo });
};

export const remove = async (req, res) => {
  const reactivo = await Reagent.findByPk(req.params.id);
  if (!reactivo) {
    return res.status(404).json({ message: 'Reactivo no encontrado' });
  }
  await reactivo.destroy();
  res.status(204).send();
};
