import db from '../models';
import { Op } from 'sequelize';
import { broadcast } from '../websocket';

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
  Carrito,
  CarritoItem,
} = db;

const ajustarHorario = (horaStr, minutos) => {
  const [horas, mins] = horaStr.split(':').map(Number);
  const date = new Date(2000, 0, 1, horas, mins + minutos);
  return date.toTimeString().split(' ')[0];
};

const ESTADOS_EQUIPO_BLOQUEANTES = ['Mantenimiento', 'Fuera de servicio'];

const includeRecursos = [
  { model: Laboratorio },
  { model: Usuario, paranoid: false },
  {
    model: Material,
    as: 'materiales',
    through: { attributes: ['cantidad'] },
    paranoid: false,
  },
  {
    model: Reagent,
    as: 'reactivos',
    through: { attributes: ['cantidad'] },
    paranoid: false,
  },
  { model: Equipment, as: 'Equipments', paranoid: false },
];

export const getAll = async (req, res) => {
  const pedidos = await Pedido.findAll({ include: includeRecursos });
  res.json({ data: pedidos.map((p) => p.toJSON()) });
};

export const getById = async (req, res) => {
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
  const warnings = [];
  let pedido;
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
      despensaMateriales = [],
      despensaReactivos = [],
      despensaEquipos = [],
    } = req.body;

    // 1. Validar laboratorio
    const lab = await Laboratorio.findByPk(laboratorioId);
    if (!lab) throw new Error('Laboratorio no encontrado');
    if (lab.edificio === 'Despensa') {
      throw new Error('No se pueden crear pedidos para el edificio "Despensa"');
    }
    if (cantidadAlumnos > lab.capacidad) {
      throw new Error(
        `Capacidad insuficiente en ${lab.nombre} (máx: ${lab.capacidad})`
      );
    }

    // 1b. Validar horario (horaInicio debe ser anterior a horaFin)
    if (horaInicio >= horaFin) {
      throw new Error('La hora de inicio debe ser anterior a la hora de fin');
    }

    // 2. Validar horarios con buffers
    const inicioBuffer = ajustarHorario(horaInicio, -60);
    const finBuffer = ajustarHorario(horaFin, 30);
    const conflicto = await Pedido.findOne({
      where: {
        fecha,
        laboratorioId,
        estado: { [Op.notIn]: ['Rechazado', 'Finalizado'] },
        horaInicio: { [Op.lt]: finBuffer },
        horaFin: { [Op.gt]: inicioBuffer },
      },
    });
    if (conflicto) {
      warnings.push('El laboratorio tiene conflicto horario con otro pedido.');
    }

    // 3. Validar equipos (disponibilidad + conflicto horario + edificio)
    const equiposValidos = [];
    for (const eqId of equipos) {
      const eq = await Equipment.findByPk(eqId, {
        include: [
          { model: Laboratorio, as: 'laboratorio', attributes: ['edificio'] },
        ],
      });
      if (!eq) {
        warnings.push(`Equipo ID ${eqId} no encontrado`);
        continue;
      }
      if (ESTADOS_EQUIPO_BLOQUEANTES.includes(eq.status)) {
        warnings.push(
          `El equipo "${eq.name}" no está disponible (estado: ${eq.status})`
        );
        continue;
      }
      // Validar edificio para equipos no móviles
      if (!eq.is_movable && eq.laboratorioId && eq.laboratorio) {
        if (eq.laboratorio.edificio !== lab.edificio) {
          throw new Error(
            `El equipo "${eq.name}" no es móvil y está en "${eq.laboratorio.edificio}", pero el laboratorio "${lab.nombre}" pertenece a "${lab.edificio}"`
          );
        }
      }
      // Verificar conflicto horario con otros pedidos aprobados
      const eqConflicto = await PedidoEquipo.findOne({
        include: [
          {
            model: Pedido,
            where: {
              fecha,
              estado: { [Op.notIn]: ['Rechazado', 'Finalizado'] },
              horaInicio: { [Op.lt]: finBuffer },
              horaFin: { [Op.gt]: inicioBuffer },
            },
            required: true,
            attributes: [],
          },
        ],
        where: { equipmentId: eqId },
      });
      if (eqConflicto) {
        warnings.push(
          `El equipo "${eq.name}" ya está reservado para otro pedido en ese horario`
        );
        continue;
      }
      equiposValidos.push(eqId);
    }

    // 4. Validar stock de materiales (disponible = stock - stockComprometido)
    const materialesValidos = [];
    for (const m of materiales) {
      const mat = await Material.findByPk(m.id);
      if (!mat) {
        warnings.push(`Material ID ${m.id} no encontrado`);
        continue;
      }
      const disponible = mat.stock - (mat.stockComprometido || 0);
      if (disponible < m.cantidad) {
        warnings.push(
          `Stock insuficiente de "${mat.name}" (disp: ${mat.stock}, disponible: ${disponible}, solic: ${m.cantidad})`
        );
      }
      materialesValidos.push(m);
    }

    // 5. Validar stock de reactivos (disponible = stock - stockComprometido)
    const reactivosValidos = [];
    for (const r of reactivos) {
      const rea = await Reagent.findByPk(r.id);
      if (!rea) {
        warnings.push(`Reactivo ID ${r.id} no encontrado`);
        continue;
      }
      const disponible = rea.stock - (rea.stockComprometido || 0);
      if (disponible < r.cantidad) {
        warnings.push(
          `Stock insuficiente de "${rea.name}" (disp: ${rea.stock}, disponible: ${disponible}, solic: ${r.cantidad})`
        );
      }
      reactivosValidos.push(r);
    }

    // 6. Crear pedido
    let despensaData = '';
    if (
      despensaMateriales.length > 0 ||
      despensaReactivos.length > 0 ||
      despensaEquipos.length > 0
    ) {
      despensaData = `__DESPENSA__:${JSON.stringify({
        despensaMateriales,
        despensaReactivos,
        despensaEquipos,
      })}`;
    }
    const descripcionFinal = [
      descripcion || '',
      warnings.length > 0 ? `[Advertencias: ${warnings.join('; ')}]` : '',
      despensaData,
    ]
      .filter(Boolean)
      .join('\n');

    pedido = await Pedido.create(
      {
        fecha,
        horaInicio,
        horaFin,
        laboratorioId,
        cantidadAlumnos,
        descripcion: descripcionFinal,
        usuarioId,
        estado: 'Pendiente',
      },
      { transaction: t }
    );

    // 7. Asociar equipos (sin cantidad)
    if (equiposValidos.length > 0) {
      const equipoRows = equiposValidos.map((eqId) => ({
        pedidoId: pedido.id,
        equipmentId: eqId,
      }));
      await PedidoEquipo.bulkCreate(equipoRows, { transaction: t });
    }

    // 8. Asociar materiales con cantidad
    for (const m of materialesValidos) {
      await PedidoMaterial.create(
        { pedidoId: pedido.id, materialId: m.id, cantidad: m.cantidad },
        { transaction: t }
      );
    }

    // 9. Asociar reactivos con cantidad
    for (const r of reactivosValidos) {
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
        descripcion:
          warnings.length > 0
            ? `Pedido creado con advertencias: ${warnings.join('; ')}`
            : 'Pedido creado',
      },
      { transaction: t }
    );

    // Crear carrito para items de despensa (si hay)
    if (
      despensaMateriales.length > 0 ||
      despensaReactivos.length > 0 ||
      despensaEquipos.length > 0
    ) {
      const carritoDespensa = await Carrito.create(
        { pedidoId: pedido.id, preparado: false },
        { transaction: t }
      );
      const itemsCarrito = [];
      for (const dm of despensaMateriales) {
        const mat = await Material.findByPk(dm.id, {
          paranoid: false,
          transaction: t,
        });
        itemsCarrito.push({
          carritoId: carritoDespensa.id,
          tipo: 'material',
          itemId: dm.id,
          nombre: mat?.name || `ID#${dm.id}`,
          cantidad: dm.cantidad || 1,
        });
      }
      for (const dr of despensaReactivos) {
        const rea = await Reagent.findByPk(dr.id, {
          paranoid: false,
          transaction: t,
        });
        itemsCarrito.push({
          carritoId: carritoDespensa.id,
          tipo: 'reactivo',
          itemId: dr.id,
          nombre: rea?.name || `ID#${dr.id}`,
          cantidad: dr.cantidad || 1,
        });
      }
      for (const deId of despensaEquipos) {
        const eq = await Equipment.findByPk(deId, {
          paranoid: false,
          transaction: t,
        });
        itemsCarrito.push({
          carritoId: carritoDespensa.id,
          tipo: 'equipo',
          itemId: deId,
          nombre: eq?.name || `ID#${deId}`,
          cantidad: 1,
        });
      }
      if (itemsCarrito.length > 0) {
        await CarritoItem.bulkCreate(itemsCarrito, { transaction: t });
      }
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    return res.status(400).json({ message: error.message });
  }

  try {
    const pedidoConRecursos = await Pedido.findByPk(pedido.id, {
      include: includeRecursos,
    });
    res.status(201).json({ data: pedidoConRecursos.toJSON(), warnings });
    broadcast('PEDIDO_CREADO', pedidoConRecursos.toJSON());
  } catch (fetchError) {
    res.status(500).json({
      message:
        'Pedido creado pero error al recuperar datos: ' + fetchError.message,
    });
  }
};

export const check = async (req, res) => {
  const warnings = [];
  const errors = [];
  try {
    const {
      fecha,
      horaInicio,
      horaFin,
      laboratorioId,
      cantidadAlumnos,
      equipos = [],
      materiales = [],
      reactivos = [],
    } = req.body;

    const lab = await Laboratorio.findByPk(laboratorioId);
    if (!lab)
      return res
        .status(404)
        .json({ errors: ['Laboratorio no encontrado'], warnings: [] });
    if (lab.edificio === 'Despensa') {
      errors.push('No se pueden crear pedidos para el edificio "Despensa"');
    }
    if (cantidadAlumnos > lab.capacidad) {
      errors.push(
        `Capacidad insuficiente en ${lab.nombre} (máx: ${lab.capacidad})`
      );
    }
    if (horaInicio && horaFin && horaInicio >= horaFin) {
      errors.push('La hora de inicio debe ser anterior a la hora de fin');
    }

    const inicioBuffer = ajustarHorario(horaInicio, -60);
    const finBuffer = ajustarHorario(horaFin, 30);
    const conflicto = await Pedido.findOne({
      where: {
        fecha,
        laboratorioId,
        estado: { [Op.notIn]: ['Rechazado', 'Finalizado'] },
        horaInicio: { [Op.lt]: finBuffer },
        horaFin: { [Op.gt]: inicioBuffer },
      },
    });
    if (conflicto) {
      warnings.push('Ya hay un pedido para este laboratorio para este horario');
    }

    for (const eqId of equipos) {
      const eq = await Equipment.findByPk(eqId, {
        include: [
          { model: Laboratorio, as: 'laboratorio', attributes: ['edificio'] },
        ],
      });
      if (!eq) {
        warnings.push(`Equipo ID ${eqId} no encontrado`);
        continue;
      }
      if (ESTADOS_EQUIPO_BLOQUEANTES.includes(eq.status)) {
        warnings.push(
          `El equipo "${eq.name}" no está disponible (estado: ${eq.status})`
        );
        continue;
      }
      if (!eq.is_movable && eq.laboratorioId && eq.laboratorio) {
        if (eq.laboratorio.edificio !== lab.edificio) {
          errors.push(
            `El equipo "${eq.name}" no es móvil y está en "${eq.laboratorio.edificio}", pero el laboratorio pertenece a "${lab.edificio}"`
          );
        }
      }
      const eqConflicto = await PedidoEquipo.findOne({
        include: [
          {
            model: Pedido,
            where: {
              fecha,
              estado: { [Op.notIn]: ['Rechazado', 'Finalizado'] },
              horaInicio: { [Op.lt]: finBuffer },
              horaFin: { [Op.gt]: inicioBuffer },
            },
            required: true,
            attributes: [],
          },
        ],
        where: { equipmentId: eqId },
      });
      if (eqConflicto) {
        warnings.push(
          `Este equipo está reservado para un horario distinto al tuyo: "${eq.name}"`
        );
      }
    }

    for (const m of materiales) {
      const mat = await Material.findByPk(m.id);
      if (!mat) {
        warnings.push(`Material ID ${m.id} no encontrado`);
        continue;
      }
      const disponible = mat.stock - (mat.stockComprometido || 0);
      if (disponible < m.cantidad)
        warnings.push(
          `Stock insuficiente de "${mat.name}" (disp: ${disponible}, solic: ${m.cantidad})`
        );
    }

    for (const r of reactivos) {
      const rea = await Reagent.findByPk(r.id);
      if (!rea) {
        warnings.push(`Reactivo ID ${r.id} no encontrado`);
        continue;
      }
      const disponible = rea.stock - (rea.stockComprometido || 0);
      if (disponible < r.cantidad)
        warnings.push(
          `Stock insuficiente de "${rea.name}" (disp: ${disponible}, solic: ${r.cantidad})`
        );
    }

    res.json({ errors, warnings });
  } catch (error) {
    res.status(500).json({ errors: [error.message], warnings: [] });
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
    broadcast('PEDIDO_MODIFICADO', updated.toJSON());
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const aprobar = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [
        { model: Equipment, as: 'Equipments' },
        { model: Material, as: 'materiales' },
        { model: Reagent, as: 'reactivos' },
      ],
    });
    if (!pedido) throw new Error('Pedido no encontrado');
    if (pedido.estado !== 'Pendiente')
      throw new Error(`El pedido ya está "${pedido.estado}"`);

    const equipos = await pedido.getEquipments();

    // Si es movible y está en otro laboratorio, actualizar su ubicación
    for (const eq of equipos) {
      if (eq.is_movable && eq.laboratorioId !== pedido.laboratorioId) {
        await eq.update(
          { laboratorioId: pedido.laboratorioId },
          { transaction: t }
        );
      }
    }

    // Descontar stock de materiales
    for (const mat of pedido.materiales) {
      const cantidad = mat.PedidoMaterial?.cantidad ?? 1;
      const disponible = mat.stock - (mat.stockComprometido || 0);
      if (disponible < cantidad) {
        throw new Error(
          `Stock insuficiente de "${mat.name}" para aprobar. Disponible: ${disponible}, necesario: ${cantidad}`
        );
      }
      await mat.update(
        {
          stock: mat.stock - cantidad,
          stockComprometido: (mat.stockComprometido || 0) + cantidad,
        },
        { transaction: t }
      );
      await MovimientoStock.create(
        {
          tipoMovimiento: 'usado',
          cantidad,
          fecha: new Date().toISOString().split('T')[0],
          observacion: `Reservado en pedido #${pedido.id}`,
          usuarioId: req.body.usuarioId || pedido.usuarioId,
          materialId: mat.id,
        },
        { transaction: t }
      );
    }

    // Descontar stock de reactivos
    for (const rea of pedido.reactivos) {
      const cantidad = rea.PedidoReactivo?.cantidad ?? 1;
      const disponible = rea.stock - (rea.stockComprometido || 0);
      if (disponible < cantidad) {
        throw new Error(
          `Stock insuficiente de "${rea.name}" para aprobar. Disponible: ${disponible}, necesario: ${cantidad}`
        );
      }
      await rea.update(
        {
          stock: rea.stock - cantidad,
          stockComprometido: (rea.stockComprometido || 0) + cantidad,
        },
        { transaction: t }
      );
      await MovimientoStock.create(
        {
          tipoMovimiento: 'usado',
          cantidad,
          fecha: new Date().toISOString().split('T')[0],
          observacion: `Reservado en pedido #${pedido.id}`,
          usuarioId: req.body.usuarioId || pedido.usuarioId,
          reactivoId: rea.id,
        },
        { transaction: t }
      );
    }

    // Verificar carrito de despensa si hay items de despensa
    const despensaMatchAprob = pedido.descripcion?.match(
      /__DESPENSA__:(\{.+\})/
    );
    if (despensaMatchAprob) {
      const carritoDespensa = await Carrito.findOne({
        where: { pedidoId: pedido.id },
        include: [{ model: CarritoItem, as: 'items' }],
        transaction: t,
      });
      if (
        carritoDespensa &&
        carritoDespensa.items?.length > 0 &&
        !carritoDespensa.preparado
      ) {
        throw new Error(
          'Los items de Despensa aún no han sido confirmados. Completá la preparación en la sección Carritos.'
        );
      }
    }

    await pedido.update({ estado: 'Aprobado' }, { transaction: t });

    // Auto-rechazar pedidos pendientes que solapen en mismo lab/fecha
    const inicioBuffer = ajustarHorario(pedido.horaInicio, -60);
    const finBuffer = ajustarHorario(pedido.horaFin, 30);
    const solapados = await Pedido.findAll({
      where: {
        id: { [Op.ne]: pedido.id },
        fecha: pedido.fecha,
        laboratorioId: pedido.laboratorioId,
        estado: 'Pendiente',
        horaInicio: { [Op.lt]: finBuffer },
        horaFin: { [Op.gt]: inicioBuffer },
      },
    });
    for (const otro of solapados) {
      await otro.update({ estado: 'Rechazado' }, { transaction: t });
      await ModificacionPedido.create(
        {
          pedidoId: otro.id,
          usuarioId: req.body.usuarioId || null,
          tipo: 'RECHAZO',
          descripcion:
            'Rechazado automáticamente por conflicto horario con pedido #' +
            pedido.id,
        },
        { transaction: t }
      );
    }

    await ModificacionPedido.create(
      {
        pedidoId: pedido.id,
        usuarioId: req.body.usuarioId || null,
        tipo: 'APROBACION',
        descripcion: req.body.descripcion || 'Pedido aprobado',
      },
      { transaction: t }
    );

    // Generar tareas automáticas
    const tareas = [];
    for (const mat of pedido.materiales) {
      const cant = mat.PedidoMaterial?.cantidad ?? 1;
      tareas.push({
        pedidoId: pedido.id,
        descripcion: `Preparar material "${mat.name}" (${cant} unidades)`,
        tipo: 'material',
      });
    }
    for (const rea of pedido.reactivos) {
      const cant = rea.PedidoReactivo?.cantidad ?? 1;
      tareas.push({
        pedidoId: pedido.id,
        descripcion: `Verificar reactivo "${rea.name}" (${cant} ${
          rea.unidadMedida || 'unidades'
        })`,
        tipo: 'reactivo',
      });
    }
    for (const eq of equipos) {
      tareas.push({
        pedidoId: pedido.id,
        descripcion: `Verificar equipo "${eq.name}" antes de la clase`,
        tipo: 'equipo',
      });
    }
    tareas.push({
      pedidoId: pedido.id,
      descripcion: 'Configurar laboratorio para la clase',
      tipo: 'general',
    });
    await db.Tarea.bulkCreate(tareas, { transaction: t });

    // Generar carrito con items de materiales y reactivos (solo edificio, no despensa)
    // Los items de despensa ya tienen su carrito creado al momento de crear el pedido
    const carrito = await Carrito.create(
      { pedidoId: pedido.id, preparado: false },
      { transaction: t }
    );
    const carritoItems = [];
    for (const mat of pedido.materiales) {
      const cant = mat.PedidoMaterial?.cantidad ?? 1;
      carritoItems.push({
        carritoId: carrito.id,
        tipo: 'material',
        itemId: mat.id,
        nombre: mat.name,
        cantidad: cant,
      });
    }
    for (const rea of pedido.reactivos) {
      const cant = rea.PedidoReactivo?.cantidad ?? 1;
      carritoItems.push({
        carritoId: carrito.id,
        tipo: 'reactivo',
        itemId: rea.id,
        nombre: rea.name,
        cantidad: cant,
      });
    }
    if (carritoItems.length > 0) {
      await CarritoItem.bulkCreate(carritoItems, { transaction: t });
    }

    await t.commit();

    const updated = await Pedido.findByPk(pedido.id, {
      include: includeRecursos,
    });
    res.json({ data: updated.toJSON() });
    broadcast('PEDIDO_APROBADO', updated.toJSON());
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

    // Devolver equipos a Despensa
    const eqsRechazo = await pedido.getEquipments();
    for (const eq of eqsRechazo) {
      await eq.update(
        { status: 'Disponible', laboratorioId: null },
        { transaction: t }
      );
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
    broadcast('PEDIDO_RECHAZADO', updated.toJSON());
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const cancelar = async (req, res) => {
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
        .json({ message: `No se puede cancelar un pedido "${pedido.estado}"` });
    }

    // Liberar equipos: volver a Despensa
    const equipos = await pedido.getEquipments();
    for (const eq of equipos) {
      await eq.update(
        { status: 'Disponible', laboratorioId: null },
        { transaction: t }
      );
    }

    await pedido.update({ estado: 'Cancelado' }, { transaction: t });

    await ModificacionPedido.create(
      {
        pedidoId: pedido.id,
        usuarioId: req.body.usuarioId || null,
        tipo: 'CANCELACION',
        descripcion: req.body.descripcion || 'Pedido cancelado por el creador',
      },
      { transaction: t }
    );

    await t.commit();

    const updated = await Pedido.findByPk(pedido.id, {
      include: includeRecursos,
    });
    res.json({ data: updated.toJSON() });
    broadcast('PEDIDO_CANCELADO', updated.toJSON());
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
        { model: Equipment, as: 'Equipments' },
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
    const materialesFinal = req.body.materiales || null;
    const reactivosFinal = req.body.reactivos || null;
    const materialesDescarte = (req.body.materiales || [])
      .filter((m) => m.descartado)
      .map((m) => m.id);
    const reactivosDescarte = (req.body.reactivos || [])
      .filter((r) => r.descartado)
      .map((r) => r.id);
    const equiposFinal = req.body.equipos || null;

    // 1. Ajustar stock de materiales (diferencia entre reservado y usado)
    for (const mat of pedido.materiales) {
      const itemBody = materialesFinal?.find((m) => m.id === mat.id);
      const cantidadReservada = mat.PedidoMaterial?.cantidad ?? 1;
      const cantidadUsada = itemBody?.cantidad ?? cantidadReservada;
      const esDescarte = materialesDescarte.includes(mat.id);
      const diferencia = cantidadReservada - cantidadUsada;
      const comprometidoActual = mat.stockComprometido || 0;

      // Liberar stock comprometido
      await mat.update(
        {
          stockComprometido: Math.max(
            0,
            comprometidoActual - cantidadReservada
          ),
        },
        { transaction: t }
      );

      if (esDescarte) {
        // Marcar como descartado (baja / roto) - no se devuelve al stock
        await mat.update(
          { stock: mat.stock - cantidadUsada },
          { transaction: t }
        );
        await MovimientoStock.create(
          {
            tipoMovimiento: 'descarte',
            cantidad: cantidadUsada,
            fecha: new Date().toISOString().split('T')[0],
            observacion: `Material descartado tras pedido #${pedido.id}`,
            usuarioId,
            materialId: mat.id,
          },
          { transaction: t }
        );
      } else if (diferencia > 0) {
        await MovimientoStock.create(
          {
            tipoMovimiento: 'entrada',
            cantidad: diferencia,
            fecha: new Date().toISOString().split('T')[0],
            observacion: `Devolución por uso menor al reservado en pedido #${pedido.id}`,
            usuarioId,
            materialId: mat.id,
          },
          { transaction: t }
        );
      } else if (diferencia < 0) {
        // Usó más de lo reservado → descontar extra
        const extra = -diferencia;
        if (mat.stock < extra) {
          throw new Error(
            `Stock insuficiente de "${mat.name}" para finalizar. Disponible: ${mat.stock}, adicional necesario: ${extra}`
          );
        }
        await mat.update({ stock: mat.stock - extra }, { transaction: t });
        await MovimientoStock.create(
          {
            tipoMovimiento: 'usado',
            cantidad: extra,
            fecha: new Date().toISOString().split('T')[0],
            observacion: `Consumo adicional en pedido #${pedido.id}`,
            usuarioId,
            materialId: mat.id,
          },
          { transaction: t }
        );
      }
    }

    // 2. Ajustar stock de reactivos (diferencia entre reservado y usado)
    for (const rea of pedido.reactivos) {
      const itemBody = reactivosFinal?.find((r) => r.id === rea.id);
      const cantidadReservada = rea.PedidoReactivo?.cantidad ?? 1;
      const cantidadUsada = itemBody?.cantidad ?? cantidadReservada;
      const esDescarte = reactivosDescarte.includes(rea.id);
      const diferencia = cantidadReservada - cantidadUsada;
      const comprometidoActual = rea.stockComprometido || 0;

      // Liberar stock comprometido
      await rea.update(
        {
          stockComprometido: Math.max(
            0,
            comprometidoActual - cantidadReservada
          ),
        },
        { transaction: t }
      );

      if (esDescarte) {
        await rea.update(
          { stock: rea.stock - cantidadUsada },
          { transaction: t }
        );
        await MovimientoStock.create(
          {
            tipoMovimiento: 'descarte',
            cantidad: cantidadUsada,
            fecha: new Date().toISOString().split('T')[0],
            observacion: `Reactivo descartado tras pedido #${pedido.id}`,
            usuarioId,
            reactivoId: rea.id,
          },
          { transaction: t }
        );
      } else if (diferencia > 0) {
        // Usó menos → devolver
        await rea.update({ stock: rea.stock + diferencia }, { transaction: t });
        await MovimientoStock.create(
          {
            tipoMovimiento: 'entrada',
            cantidad: diferencia,
            fecha: new Date().toISOString().split('T')[0],
            observacion: `Devolución por uso menor al reservado en pedido #${pedido.id}`,
            usuarioId,
            reactivoId: rea.id,
          },
          { transaction: t }
        );
      } else if (diferencia < 0) {
        // Usó más → descontar extra
        const extra = -diferencia;
        if (rea.stock < extra) {
          throw new Error(
            `Stock insuficiente de "${rea.name}" para finalizar. Disponible: ${rea.stock}, adicional necesario: ${extra}`
          );
        }
        await rea.update({ stock: rea.stock - extra }, { transaction: t });
        await MovimientoStock.create(
          {
            tipoMovimiento: 'usado',
            cantidad: extra,
            fecha: new Date().toISOString().split('T')[0],
            observacion: `Consumo adicional en pedido #${pedido.id}`,
            usuarioId,
            reactivoId: rea.id,
          },
          { transaction: t }
        );
      }
    }

    // 3. Liberar/manejar equipos
    const equipos = await pedido.getEquipments();
    for (const eq of equipos) {
      const itemBody = equiposFinal?.find((e) => e.id === eq.id);
      const estadoFinal = itemBody?.estado || 'Disponible';

      if (
        !['Disponible', 'Mantenimiento', 'Roto', 'Fuera de servicio'].includes(
          estadoFinal
        )
      ) {
        throw new Error(`Estado inválido para equipo: ${estadoFinal}`);
      }

      const updateData = { status: estadoFinal };
      if (estadoFinal === 'Disponible') updateData.laboratorioId = null;
      await eq.update(updateData, { transaction: t });

      const observaciones =
        estadoFinal === 'Mantenimiento'
          ? `Enviado a mantenimiento tras pedido #${pedido.id}`
          : estadoFinal === 'Roto' || estadoFinal === 'Fuera de servicio'
          ? `Equipo reportado como roto tras pedido #${pedido.id}`
          : `Uso finalizado para pedido #${pedido.id}`;

      await UsoEquipo.create(
        {
          equipoId: eq.id,
          pedidoId: pedido.id,
          fechaInicio: new Date(pedido.fecha + 'T' + pedido.horaInicio),
          fechaFin: new Date(pedido.fecha + 'T' + pedido.horaFin),
          observaciones,
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

    // 5. Marcar tareas como completadas
    await db.Tarea.update(
      { completada: true },
      { where: { pedidoId: pedido.id }, transaction: t }
    );

    // 6. Marcar pedido como finalizado
    await pedido.update({ estado: 'Finalizado' }, { transaction: t });
    await t.commit();

    const updated = await Pedido.findByPk(pedido.id, {
      include: includeRecursos,
    });
    res.json({ data: updated.toJSON() });
    broadcast('PEDIDO_FINALIZADO', updated.toJSON());
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
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'apellido', 'email'],
          paranoid: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ data: historial.map((h) => h.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deshacerAprobacion = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [
        { model: Material, as: 'materiales', paranoid: false },
        { model: Reagent, as: 'reactivos', paranoid: false },
        { model: Equipment, as: 'Equipments', paranoid: false },
      ],
    });
    if (!pedido) throw new Error('Pedido no encontrado');
    if (pedido.estado !== 'Aprobado') {
      throw new Error(
        `Solo se puede deshacer la aprobación de pedidos aprobados. Estado: ${pedido.estado}`
      );
    }

    // Restaurar stock de materiales
    for (const mat of pedido.materiales) {
      const cantidad = mat.PedidoMaterial?.cantidad ?? 1;
      await mat.update(
        {
          stock: mat.stock + cantidad,
          stockComprometido: Math.max(
            0,
            (mat.stockComprometido || 0) - cantidad
          ),
        },
        { transaction: t }
      );
    }

    // Restaurar stock de reactivos
    for (const rea of pedido.reactivos) {
      const cantidad = rea.PedidoReactivo?.cantidad ?? 1;
      await rea.update(
        {
          stock: rea.stock + cantidad,
          stockComprometido: Math.max(
            0,
            (rea.stockComprometido || 0) - cantidad
          ),
        },
        { transaction: t }
      );
    }

    await pedido.update({ estado: 'Pendiente' }, { transaction: t });

    await ModificacionPedido.create(
      {
        pedidoId: pedido.id,
        usuarioId: req.body.usuarioId || null,
        tipo: 'MODIFICACION',
        descripcion: 'Aprobación deshecha. Stock restaurado.',
      },
      { transaction: t }
    );

    await t.commit();

    const updated = await Pedido.findByPk(pedido.id, {
      include: includeRecursos,
    });
    res.json({ data: updated.toJSON() });
    broadcast('PEDIDO_MODIFICADO', updated.toJSON());
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
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
    const equipos = await pedido.getEquipments();
    for (const eq of equipos) {
      await eq.update({ status: 'Disponible' });
    }
  }
  await pedido.destroy();
  res.status(204).send();
};
