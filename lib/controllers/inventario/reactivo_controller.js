import db from '../../models';
import { broadcast } from '../../websocket';

const {
  Reagent,
  Laboratorio,
  MovimientoStock,
  SustanciaBasica,
  ReactivoSustancia,
} = db;

const includeComposicion = [
  { model: Laboratorio, as: 'laboratorio' },
  {
    model: SustanciaBasica,
    as: 'composicion',
    through: { attributes: ['porcentaje'] },
  },
];

export const getAll = async (req, res) => {
  const { search, proximoVencer, page: pageRaw, limit: limitRaw } = req.query;
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
  if (pageRaw) {
    const page = parseInt(pageRaw) || 1;
    const limit = parseInt(limitRaw) || 25;
    const offset = (page - 1) * limit;
    const { count, rows } = await Reagent.findAndCountAll({
      where,
      include: includeComposicion,
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
  const reactivos = await Reagent.findAll({
    where,
    include: includeComposicion,
    order: [['name', 'ASC']],
  });
  res.json({ data: reactivos });
};

export const getById = async (req, res) => {
  const reactivo = await Reagent.findByPk(req.params.id, {
    include: [
      ...includeComposicion,
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
    stockMinimo,
    unidadMedida,
    vencimiento,
    prep_time,
    laboratorioId,
    composicion,
  } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }
  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ message: 'El stock no puede ser negativo' });
  }
  if (composicion && composicion.length > 0) {
    const suma = composicion.reduce((acc, c) => acc + c.porcentaje, 0);
    if (Math.abs(suma - 100) > 0.01) {
      return res.status(400).json({
        message: `La suma de los porcentajes debe ser 100% (actual: ${suma}%)`,
      });
    }
  }
  const reactivo = await Reagent.create({
    name,
    descripcion,
    stock: stock || 0,
    stockMinimo: stockMinimo || 0,
    unidadMedida,
    vencimiento: vencimiento || null,
    prep_time: prep_time || 0,
    laboratorioId: laboratorioId || null,
  });
  if (composicion && composicion.length > 0) {
    const rows = composicion.map((c) => ({
      reactivoId: reactivo.id,
      sustanciaBasicaId: c.sustanciaBasicaId,
      porcentaje: c.porcentaje,
    }));
    await ReactivoSustancia.bulkCreate(rows);
  }
  const created = await Reagent.findByPk(reactivo.id, {
    include: includeComposicion,
  });
  res.status(201).json({ data: created });
  broadcast('INVENTARIO_MODIFICADO', {
    tipo: 'reactivo',
    accion: 'crear',
    data: created,
  });
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
    stockMinimo,
    unidadMedida,
    vencimiento,
    prep_time,
    laboratorioId,
    composicion,
  } = req.body;
  if (name !== undefined && name.trim() === '') {
    return res.status(400).json({ message: 'El nombre no puede estar vacío' });
  }
  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ message: 'El stock no puede ser negativo' });
  }
  if (composicion && composicion.length > 0) {
    const suma = composicion.reduce((acc, c) => acc + c.porcentaje, 0);
    if (Math.abs(suma - 100) > 0.01) {
      return res.status(400).json({
        message: `La suma de los porcentajes debe ser 100% (actual: ${suma}%)`,
      });
    }
  }
  await reactivo.update({
    name: name !== undefined ? name : reactivo.name,
    descripcion: descripcion !== undefined ? descripcion : reactivo.descripcion,
    stock: stock !== undefined ? stock : reactivo.stock,
    stockMinimo: stockMinimo !== undefined ? stockMinimo : reactivo.stockMinimo,
    unidadMedida:
      unidadMedida !== undefined ? unidadMedida : reactivo.unidadMedida,
    vencimiento: vencimiento !== undefined ? vencimiento : reactivo.vencimiento,
    prep_time: prep_time !== undefined ? prep_time : reactivo.prep_time,
    laboratorioId:
      laboratorioId !== undefined ? laboratorioId : reactivo.laboratorioId,
  });
  if (composicion !== undefined) {
    await ReactivoSustancia.destroy({ where: { reactivoId: reactivo.id } });
    if (composicion.length > 0) {
      const rows = composicion.map((c) => ({
        reactivoId: reactivo.id,
        sustanciaBasicaId: c.sustanciaBasicaId,
        porcentaje: c.porcentaje,
      }));
      await ReactivoSustancia.bulkCreate(rows);
    }
  }
  const updated = await Reagent.findByPk(reactivo.id, {
    include: includeComposicion,
  });
  res.json({ data: updated });
  broadcast('INVENTARIO_MODIFICADO', {
    tipo: 'reactivo',
    accion: 'editar',
    data: updated,
  });
};

export const producir = async (req, res) => {
  const { id } = req.params;
  const { cantidad, usuarioId } = req.body;
  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
  }
  if (!usuarioId) {
    return res
      .status(400)
      .json({ message: 'El usuario responsable es obligatorio' });
  }
  const reactivo = await Reagent.findByPk(id, {
    include: [
      {
        model: SustanciaBasica,
        as: 'composicion',
        through: { attributes: ['porcentaje'] },
      },
    ],
  });
  if (!reactivo) {
    return res.status(404).json({ message: 'Reactivo no encontrado' });
  }
  if (!reactivo.composicion || reactivo.composicion.length === 0) {
    return res
      .status(400)
      .json({ message: 'Este reactivo no tiene composición definida' });
  }
  const faltantes = [];
  for (const s of reactivo.composicion) {
    const necesario = Math.round(
      cantidad * (s.ReactivoSustancia.porcentaje / 100)
    );
    if (s.stock < necesario) {
      faltantes.push({
        name: s.name,
        disponible: s.stock,
        necesario,
        porcentaje: s.ReactivoSustancia.porcentaje,
      });
    }
  }
  if (faltantes.length > 0) {
    return res
      .status(400)
      .json({ message: 'Stock insuficiente de sustancias básicas', faltantes });
  }
  const detalles = [];
  for (const s of reactivo.composicion) {
    const necesario = Math.round(
      cantidad * (s.ReactivoSustancia.porcentaje / 100)
    );
    await s.update({ stock: s.stock - necesario });
    detalles.push(`${s.name} (${necesario} ${reactivo.unidadMedida || 'u'})`);
  }
  const cantidadEntera = Math.round(cantidad);
  await reactivo.update({ stock: reactivo.stock + cantidadEntera });
  await MovimientoStock.create({
    tipoMovimiento: 'entrada',
    cantidad: cantidadEntera,
    fecha: new Date().toISOString().split('T')[0],
    observacion: `Producido desde sustancias básicas: ${detalles.join(', ')}`,
    usuarioId: usuarioId || null,
    reactivoId: reactivo.id,
  });
  const updated = await Reagent.findByPk(reactivo.id, {
    include: includeComposicion,
  });
  res.json({ data: updated });
  broadcast('INVENTARIO_MODIFICADO', {
    tipo: 'reactivo',
    accion: 'producir',
    data: updated,
  });
};

export const remove = async (req, res) => {
  const reactivo = await Reagent.findByPk(req.params.id);
  if (!reactivo) {
    return res.status(404).json({ message: 'Reactivo no encontrado' });
  }
  await reactivo.destroy();
  broadcast('INVENTARIO_MODIFICADO', {
    tipo: 'reactivo',
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
  const reactivo = await Reagent.findByPk(id, {
    include: [{ model: Laboratorio, as: 'laboratorio' }],
  });
  if (!reactivo) {
    return res.status(404).json({ message: 'Reactivo no encontrado' });
  }
  const labDestino = await Laboratorio.findByPk(nuevoLaboratorioId);
  if (!labDestino) {
    return res
      .status(404)
      .json({ message: 'Laboratorio destino no encontrado' });
  }
  const labOrigen = reactivo.laboratorio;
  const labOrigenNombre = labOrigen
    ? `${labOrigen.nombre} (${labOrigen.edificio || 'Sin edificio'})`
    : 'Sin laboratorio';
  const labDestinoNombre = `${labDestino.nombre} (${
    labDestino.edificio || 'Sin edificio'
  })`;
  const viejoLabId = reactivo.laboratorioId;

  let t;
  try {
    t = await db.sequelize.transaction();
    await reactivo.update(
      { laboratorioId: nuevoLaboratorioId },
      { transaction: t }
    );
    if (viejoLabId) {
      await MovimientoStock.create(
        {
          tipoMovimiento: 'salida',
          cantidad: reactivo.stock,
          fecha: new Date().toISOString().split('T')[0],
          observacion: `Transferencia a ${labDestinoNombre}`,
          usuarioId: usuarioId || null,
          reactivoId: reactivo.id,
        },
        { transaction: t }
      );
    }
    await MovimientoStock.create(
      {
        tipoMovimiento: 'entrada',
        cantidad: reactivo.stock,
        fecha: new Date().toISOString().split('T')[0],
        observacion: viejoLabId
          ? `Transferencia desde ${labOrigenNombre}`
          : `Asignado a ${labDestinoNombre}`,
        usuarioId: usuarioId || null,
        reactivoId: reactivo.id,
      },
      { transaction: t }
    );
    await t.commit();
  } catch (error) {
    if (t) await t.rollback();
    return res.status(500).json({ message: error.message });
  }
  const updated = await Reagent.findByPk(id, {
    include: [{ model: Laboratorio, as: 'laboratorio' }],
  });
  res.json({ data: updated });
};
