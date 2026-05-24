import db from '../models';
import { Op } from 'sequelize';

const {
  Pedido,
  Laboratorio,
  Usuario,
  Equipment,
  Material,
  Reagent,
  MovimientoStock,
  UsoEquipo,
  PedidoMaterial,
  PedidoReactivo,
  PedidoEquipo,
  ModificacionPedido,
} = db;

const ajustarHorario = (horaStr, minutos) => {
  const [horas, mins] = horaStr.split(':').map(Number);
  const date = new Date(2000, 0, 1, horas, mins + minutos);
  return date.toTimeString().split(' ')[0];
};

const ESTADOS_EQUIPO_VALIDOS = ['Disponible'];

const includeRecursos = [
  { model: Laboratorio },
  { model: Usuario },
  {
    model: Material,
    as: 'materiales',
    through: { attributes: ['cantidad'] },
  },
  {
    model: Reagent,
    as: 'reactivos',
    through: { attributes: ['cantidad'] },
  },
  { model: Equipment },
];

export const index = async (req, res) => {
  const pedidos = await Pedido.findAll({ include: includeRecursos });
  res.json({ data: pedidos.map((p) => p.toJSON()) });
};

export const show = async (req, res) => {
  const pedido = await Pedido.findByPk(req.params.id, {
    include: includeRecursos,
  });
  if (!pedido) {
    return res
      .status(404)
      .json({ message: `No se encontró un pedido con id ${req.params.id}` });
  }
  res.json({ data: pedido.toJSON() });
};

export const create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      fecha,
      horaInicio,
      horaFin,
      laboratorioId,
      cantidadAlumnos,
      descripcion,
      usuarioId,
      equipos = [],
      materiales = [],
      reactivos = [],
    } = req.body;

    // 1. Validar laboratorio
    const lab = await Laboratorio.findByPk(laboratorioId);
    if (!lab) throw new Error('Laboratorio no encontrado');
    if (cantidadAlumnos > lab.capacidad) {
      throw new Error(
        `Capacidad insuficiente en ${lab.nombre}. Máximo: ${lab.capacidad}`
      );
    }

    // 2. Validar horarios con buffers
    const inicioBuffer = ajustarHorario(horaInicio, -60);
    const finBuffer = ajustarHorario(horaFin, 30);
    const conflicto = await Pedido.findOne({
      where: {
        fecha,
        laboratorioId,
        estado: { [Op.ne]: 'Rechazado' },
        horaInicio: { [Op.lt]: finBuffer },
        horaFin: { [Op.gt]: inicioBuffer },
      },
    });
    if (conflicto) {
      throw new Error(
        'El laboratorio está ocupado o en periodo de limpieza/preparación.'
      );
    }

    // 3. Validar equipos
    for (const eqId of equipos) {
      const eq = await Equipment.findByPk(eqId);
      if (!eq) throw new Error(`Equipo ID ${eqId} no encontrado`);
      if (!ESTADOS_EQUIPO_VALIDOS.includes(eq.status)) {
        throw new Error(
          `El equipo "${eq.name}" no está disponible (estado: ${eq.status})`
        );
      }
    }

    // 4. Validar stock de materiales
    for (const m of materiales) {
      const mat = await Material.findByPk(m.id);
      if (!mat) throw new Error(`Material ID ${m.id} no encontrado`);
      if (mat.stock < m.cantidad) {
        throw new Error(
          `Stock insuficiente de "${mat.name}". Disponible: ${mat.stock}, solicitado: ${m.cantidad}`
        );
      }
    }

    // 5. Validar stock de reactivos
    for (const r of reactivos) {
      const rea = await Reagent.findByPk(r.id);
      if (!rea) throw new Error(`Reactivo ID ${r.id} no encontrado`);
      if (rea.stock < r.cantidad) {
        throw new Error(
          `Stock insuficiente de "${rea.name}". Disponible: ${rea.stock}, solicitado: ${r.cantidad}`
        );
      }
    }

    // 6. Crear pedido
    const pedido = await Pedido.create(
      {
        fecha,
        horaInicio,
        horaFin,
        laboratorioId,
        cantidadAlumnos,
        descripcion,
        usuarioId,
        estado: 'Pendiente',
      },
      { transaction: t }
    );

    // 7. Asociar equipos (sin cantidad)
    if (equipos.length > 0) {
      const equipoRows = equipos.map((eqId) => ({
        pedidoId: pedido.id,
        equipmentId: eqId,
      }));
      await PedidoEquipo.bulkCreate(equipoRows, { transaction: t });
    }

    // 8. Asociar materiales con cantidad
    for (const m of materiales) {
      await PedidoMaterial.create(
        { pedidoId: pedido.id, materialId: m.id, cantidad: m.cantidad },
        { transaction: t }
      );
    }

    // 9. Asociar reactivos con cantidad
    for (const r of reactivos) {
      await PedidoReactivo.create(
        { pedidoId: pedido.id, reagentId: r.id, cantidad: r.cantidad },
        { transaction: t }
      );
    }

    // Registrar creación en historial
    await ModificacionPedido.create(
      {
        pedidoId: pedido.id,
        usuarioId,
        tipo: 'CREACION',
        descripcion: 'Pedido creado',
      },
      { transaction: t }
    );

    await t.commit();

    const pedidoConRecursos = await Pedido.findByPk(pedido.id, {
      include: includeRecursos,
    });
    res.status(201).json({ data: pedidoConRecursos.toJSON() });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: `No se encontró un pedido con id ${req.params.id}` });
    }

    const cambios = {};
    const campos = [
      'estado',
      'fecha',
      'horaInicio',
      'horaFin',
      'cantidadAlumnos',
      'descripcion',
    ];
    for (const campo of campos) {
      if (req.body[campo] !== undefined && req.body[campo] !== pedido[campo]) {
        cambios[campo] = { antes: pedido[campo], despues: req.body[campo] };
      }
    }

    await pedido.update(req.body, { transaction: t });

    if (Object.keys(cambios).length > 0) {
      await ModificacionPedido.create(
        {
          pedidoId: pedido.id,
          usuarioId: req.body.usuarioId || null,
          tipo: 'MODIFICACION',
          cambios,
          descripcion: `Pedido modificado. Cambios: ${Object.keys(cambios).join(
            ', '
          )}`,
        },
        { transaction: t }
      );
    }

    await t.commit();

    const updated = await Pedido.findByPk(pedido.id, {
      include: includeRecursos,
    });
    res.json({ data: updated.toJSON() });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

export const aprobar = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [
        { model: Equipment },
        { model: Material, as: 'materiales' },
        { model: Reagent, as: 'reactivos' },
      ],
    });
    if (!pedido) throw new Error('Pedido no encontrado');
    if (pedido.estado !== 'Pendiente')
      throw new Error(`El pedido ya está "${pedido.estado}"`);

    // Reservar equipos (cambiar estado a "En uso")
    const equipos = await pedido.getEquipment();
    for (const eq of equipos) {
      await eq.update({ status: 'En uso' }, { transaction: t });
    }

    await pedido.update({ estado: 'Aprobado' }, { transaction: t });

    await ModificacionPedido.create(
      {
        pedidoId: pedido.id,
        usuarioId: req.body.usuarioId || null,
        tipo: 'APROBACION',
        descripcion: req.body.descripcion || 'Pedido aprobado',
      },
      { transaction: t }
    );

    await t.commit();

    const updated = await Pedido.findByPk(pedido.id, {
      include: includeRecursos,
    });
    res.json({ data: updated.toJSON() });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const rechazar = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    if (pedido.estado !== 'Pendiente') {
      await t.rollback();
      return res
        .status(400)
        .json({ message: `El pedido ya está "${pedido.estado}"` });
    }

    await pedido.update({ estado: 'Rechazado' }, { transaction: t });

    await ModificacionPedido.create(
      {
        pedidoId: pedido.id,
        usuarioId: req.body.usuarioId || null,
        tipo: 'RECHAZO',
        descripcion: req.body.descripcion || 'Pedido rechazado',
      },
      { transaction: t }
    );

    await t.commit();

    const updated = await Pedido.findByPk(pedido.id, {
      include: includeRecursos,
    });
    res.json({ data: updated.toJSON() });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const finalizar = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [
        { model: Equipment },
        {
          model: Material,
          as: 'materiales',
          through: { attributes: ['cantidad'] },
        },
        {
          model: Reagent,
          as: 'reactivos',
          through: { attributes: ['cantidad'] },
        },
      ],
    });
    if (!pedido) throw new Error('Pedido no encontrado');
    if (pedido.estado !== 'Aprobado') {
      throw new Error(
        `Solo se pueden finalizar pedidos aprobados. Estado actual: ${pedido.estado}`
      );
    }

    const usuarioId = req.body.usuarioId || pedido.usuarioId;

    // 1. Consumir materiales: descontar stock y crear movimientos
    for (const mat of pedido.materiales) {
      const cantidadUsada = mat.PedidoMaterial
        ? mat.PedidoMaterial.cantidad
        : 1;
      if (mat.stock < cantidadUsada) {
        throw new Error(
          `Stock insuficiente de "${mat.name}" para finalizar. Disponible: ${mat.stock}, necesario: ${cantidadUsada}`
        );
      }
      await mat.update(
        { stock: mat.stock - cantidadUsada },
        { transaction: t }
      );
      await MovimientoStock.create(
        {
          tipoMovimiento: 'salida',
          cantidad: cantidadUsada,
          fecha: new Date().toISOString().split('T')[0],
          observacion: `Consumido en pedido #${pedido.id}`,
          usuarioId,
          materialId: mat.id,
        },
        { transaction: t }
      );
    }

    // 2. Consumir reactivos
    for (const rea of pedido.reactivos) {
      const cantidadUsada = rea.PedidoReactivo
        ? rea.PedidoReactivo.cantidad
        : 1;
      if (rea.stock < cantidadUsada) {
        throw new Error(
          `Stock insuficiente de "${rea.name}" para finalizar. Disponible: ${rea.stock}, necesario: ${cantidadUsada}`
        );
      }
      await rea.update(
        { stock: rea.stock - cantidadUsada },
        { transaction: t }
      );
      await MovimientoStock.create(
        {
          tipoMovimiento: 'salida',
          cantidad: cantidadUsada,
          fecha: new Date().toISOString().split('T')[0],
          observacion: `Consumido en pedido #${pedido.id}`,
          usuarioId,
          reactivoId: rea.id,
        },
        { transaction: t }
      );
    }

    // 3. Liberar equipos
    const equipos = await pedido.getEquipment();
    for (const eq of equipos) {
      await eq.update({ status: 'Disponible' }, { transaction: t });
      await UsoEquipo.create(
        {
          equipoId: eq.id,
          pedidoId: pedido.id,
          fechaInicio: new Date(pedido.fecha + 'T' + pedido.horaInicio),
          fechaFin: new Date(),
          observaciones: `Uso finalizado para pedido #${pedido.id}`,
        },
        { transaction: t }
      );
    }

    // 4. Registrar finalización en historial
    await ModificacionPedido.create(
      {
        pedidoId: pedido.id,
        usuarioId,
        tipo: 'FINALIZACION',
        descripcion: 'Clase finalizada. Stock y equipos actualizados.',
      },
      { transaction: t }
    );

    // 5. Marcar pedido como finalizado
    await pedido.update({ estado: 'Finalizado' }, { transaction: t });
    await t.commit();

    const updated = await Pedido.findByPk(pedido.id, {
      include: includeRecursos,
    });
    res.json({ data: updated.toJSON() });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const getHistorial = async (req, res) => {
  try {
    const historial = await ModificacionPedido.findAll({
      where: { pedidoId: req.params.id },
      include: [
        { model: Usuario, attributes: ['id', 'nombre', 'apellido', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ data: historial.map((h) => h.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  const pedido = await Pedido.findByPk(req.params.id);
  if (!pedido) {
    return res
      .status(404)
      .json({ message: `No se encontró un pedido con id ${req.params.id}` });
  }
  // Liberar equipos si estaba aprobado
  if (pedido.estado === 'Aprobado') {
    const equipos = await pedido.getEquipment();
    for (const eq of equipos) {
      await eq.update({ status: 'Disponible' });
    }
  }
  await pedido.destroy();
  res.status(204).send();
};
