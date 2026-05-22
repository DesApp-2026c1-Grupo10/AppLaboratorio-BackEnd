import db from '../../models';

const { MovimientoStock, Material, Reagent, Usuario } = db;

export const getAll = async (req, res) => {
  const { tipo, materialId, reactivoId } = req.query;
  const where = {};
  if (tipo) where.tipoMovimiento = tipo;
  if (materialId) where.materialId = materialId;
  if (reactivoId) where.reactivoId = reactivoId;

  const movimientos = await MovimientoStock.findAll({
    where,
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'apellido'],
      },
      { model: Material, as: 'material', attributes: ['id', 'name'] },
      { model: Reagent, as: 'reactivo', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json({ data: movimientos });
};

export const getById = async (req, res) => {
  const movimiento = await MovimientoStock.findByPk(req.params.id, {
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'apellido'],
      },
      { model: Material, as: 'material' },
      { model: Reagent, as: 'reactivo' },
    ],
  });
  if (!movimiento) {
    return res.status(404).json({ message: 'Movimiento no encontrado' });
  }
  res.json({ data: movimiento });
};

export const create = async (req, res) => {
  const {
    tipoMovimiento,
    cantidad,
    fecha,
    observacion,
    usuarioId,
    materialId,
    reactivoId,
  } = req.body;

  if (!tipoMovimiento || !['entrada', 'salida'].includes(tipoMovimiento)) {
    return res
      .status(400)
      .json({ message: 'Tipo de movimiento inválido (entrada/salida)' });
  }
  if (!cantidad || cantidad < 1) {
    return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
  }
  if (!usuarioId) {
    return res
      .status(400)
      .json({ message: 'El usuario responsable es obligatorio' });
  }
  if (!materialId && !reactivoId) {
    return res
      .status(400)
      .json({ message: 'Debe especificar un material o un reactivo' });
  }

  // Validar stock suficiente si es salida
  if (tipoMovimiento === 'salida') {
    if (materialId) {
      const material = await Material.findByPk(materialId);
      if (!material)
        return res.status(404).json({ message: 'Material no encontrado' });
      if (material.stock < cantidad) {
        return res.status(400).json({
          message: `Stock insuficiente de ${material.name}. Disponible: ${material.stock}, solicitado: ${cantidad}`,
        });
      }
    }
    if (reactivoId) {
      const reactivo = await Reagent.findByPk(reactivoId);
      if (!reactivo)
        return res.status(404).json({ message: 'Reactivo no encontrado' });
      if (reactivo.stock < cantidad) {
        return res.status(400).json({
          message: `Stock insuficiente de ${reactivo.name}. Disponible: ${reactivo.name}, solicitado: ${cantidad}`,
        });
      }
    }
  }

  let t;
  try {
    t = await db.sequelize.transaction();
    const movimiento = await MovimientoStock.create(
      {
        tipoMovimiento,
        cantidad,
        fecha: fecha || new Date().toISOString().split('T')[0],
        observacion,
        usuarioId,
        materialId,
        reactivoId,
      },
      { transaction: t }
    );

    // Actualizar stock
    if (materialId) {
      const material = await Material.findByPk(materialId, { transaction: t });
      const nuevoStock =
        tipoMovimiento === 'entrada'
          ? material.stock + cantidad
          : material.stock - cantidad;
      await material.update({ stock: nuevoStock }, { transaction: t });
    }
    if (reactivoId) {
      const reactivo = await Reagent.findByPk(reactivoId, { transaction: t });
      const nuevoStock =
        tipoMovimiento === 'entrada'
          ? reactivo.stock + cantidad
          : reactivo.stock - cantidad;
      await reactivo.update({ stock: nuevoStock }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ data: movimiento });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  const movimiento = await MovimientoStock.findByPk(req.params.id);
  if (!movimiento) {
    return res.status(404).json({ message: 'Movimiento no encontrado' });
  }
  await movimiento.destroy();
  res.status(204).send();
};
