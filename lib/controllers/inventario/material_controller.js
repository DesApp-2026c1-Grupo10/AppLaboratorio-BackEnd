import db from '../../models';
import { broadcast } from '../../websocket';

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
  broadcast('INVENTARIO_MODIFICADO', {
    tipo: 'material',
    accion: 'crear',
    data: material,
  });
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
  broadcast('INVENTARIO_MODIFICADO', {
    tipo: 'material',
    accion: 'editar',
    data: material,
  });
};

export const remove = async (req, res) => {
  const material = await Material.findByPk(req.params.id);
  if (!material) {
    return res.status(404).json({ message: 'Material no encontrado' });
  }
  await material.destroy();
  broadcast('INVENTARIO_MODIFICADO', {
    tipo: 'material',
    accion: 'eliminar',
    data: { id: req.params.id },
  });
  res.status(204).send();
};

export const mover = async (req, res) => {
  const { id } = req.params;
  const { nuevoLaboratorioId, usuarioId } = req.body;
  if (!nuevoLaboratorioId) {
    return res
      .status(400)
      .json({ message: 'El laboratorio destino es obligatorio' });
  }
  const material = await Material.findByPk(id, {
    include: [{ model: Laboratorio, as: 'laboratorio' }],
  });
  if (!material) {
    return res.status(404).json({ message: 'Material no encontrado' });
  }
  const labDestino = await Laboratorio.findByPk(nuevoLaboratorioId);
  if (!labDestino) {
    return res
      .status(404)
      .json({ message: 'Laboratorio destino no encontrado' });
  }
  const labOrigen = material.laboratorio;
  const labOrigenNombre = labOrigen
    ? `${labOrigen.nombre} (${labOrigen.edificio || 'Sin edificio'})`
    : 'Sin laboratorio';
  const labDestinoNombre = `${labDestino.nombre} (${
    labDestino.edificio || 'Sin edificio'
  })`;
  const viejoLabId = material.laboratorioId;

  let t;
  try {
    t = await db.sequelize.transaction();
    await material.update(
      { laboratorioId: nuevoLaboratorioId },
      { transaction: t }
    );
    // Salida del laboratorio origen
    if (viejoLabId) {
      await MovimientoStock.create(
        {
          tipoMovimiento: 'salida',
          cantidad: material.stock,
          fecha: new Date().toISOString().split('T')[0],
          observacion: `Transferencia a ${labDestinoNombre}`,
          usuarioId: usuarioId || null,
          materialId: material.id,
        },
        { transaction: t }
      );
    }
    // Entrada al laboratorio destino
    await MovimientoStock.create(
      {
        tipoMovimiento: 'entrada',
        cantidad: material.stock,
        fecha: new Date().toISOString().split('T')[0],
        observacion: viejoLabId
          ? `Transferencia desde ${labOrigenNombre}`
          : `Asignado a ${labDestinoNombre}`,
        usuarioId: usuarioId || null,
        materialId: material.id,
      },
      { transaction: t }
    );
    await t.commit();
  } catch (error) {
    if (t) await t.rollback();
    return res.status(500).json({ message: error.message });
  }

  const updated = await Material.findByPk(id, {
    include: [{ model: Laboratorio, as: 'laboratorio' }],
  });
  res.json({ data: updated });
};
