import db from '../models';
import { Op } from 'sequelize';

const {
  Pedido,
  Laboratorio,
  Usuario,
  Equipment,
  Material,
  Reagent,
  PedidoMaterial,
  PedidoReactivo,
} = db;

// Función para calcular los buffers de tiempo
const ajustarHorario = (horaStr, minutos) => {
  const [horas, mins] = horaStr.split(':').map(Number);
  const date = new Date(2000, 0, 1, horas, mins + minutos);
  return date.toTimeString().split(' ')[0];
};

export const index = async (req, res) => {
  const pedidos = await Pedido.findAll({
    include: [Laboratorio, Usuario],
  });
  res.json({ data: pedidos.map((pedido) => pedido.toJSON()) });
};

export const show = async (req, res) => {
  const pedido = await Pedido.findByPk(req.params.id, {
    include: [Laboratorio, Usuario],
  });
  if (pedido) {
    res.json({ data: pedido.toJSON() });
  } else {
    res
      .status(404)
      .json({ message: `No se encontró un pedido con id ${req.params.id}` });
  }
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
      equipos = [],
      materiales = [],
      reactivos = [],
    } = req.body;

    // 1. Validar Capacidad
    const lab = await Laboratorio.findByPk(laboratorioId);
    if (!lab) throw new Error('Laboratorio no encontrado');
    if (cantidadAlumnos > lab.capacidad) {
      throw new Error(
        `Capacidad insuficiente en ${lab.nombre}. Máximo: ${lab.capacidad}`
      );
    }

    // 2. Validar Horarios y Buffers
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

    // 3. Validar Equipos (Disponibilidad y Edificio)
    for (const eqId of equipos) {
      const eq = await Equipment.findByPk(eqId);
      if (!eq || eq.status !== 'AVAILABLE')
        throw new Error(`El equipo ${eqId} no está disponible.`);
      if (!eq.is_movable && eq.bld_id !== lab.bld_id) {
        throw new Error(
          `El equipo ${eq.name} es fijo y no pertenece al edificio del laboratorio.`
        );
      }
    }

    // 4. Validar Stock
    for (const m of materiales) {
      const mat = await Material.findByPk(m.id);
      if (!mat || mat.stock < m.cantidad)
        throw new Error(
          `Stock insuficiente de: ${mat ? mat.name : 'Material desconocido'}`
        );
    }
    for (const r of reactivos) {
      const rea = await Reagent.findByPk(r.id);
      if (!rea || rea.stock < r.cantidad)
        throw new Error(
          `Stock insuficiente de: ${rea ? rea.name : 'Reactivo desconocido'}`
        );
    }

    // 5. Creación del Pedido
    const pedido = await Pedido.create(req.body, { transaction: t });

    // 6. Asociar recursos
    if (equipos.length > 0)
      await pedido.setEquipment(equipos, { transaction: t });

    for (const m of materiales) {
      await PedidoMaterial.create(
        { pedidoId: pedido.id, materialId: m.id, cantidad: m.cantidad },
        { transaction: t }
      );
    }
    for (const r of reactivos) {
      await PedidoReactivo.create(
        { pedidoId: pedido.id, reagentId: r.id, cantidad: r.cantidad },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({ data: pedido.toJSON() });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  const pedido = await Pedido.findByPk(req.params.id);
  if (pedido) {
    await pedido.update(req.body);
    res.json({ data: pedido.toJSON() });
  } else {
    res
      .status(404)
      .json({ message: `No se encontró un pedido con id ${req.params.id}` });
  }
};

export const remove = async (req, res) => {
  const pedido = await Pedido.findByPk(req.params.id);
  if (pedido) {
    await pedido.destroy();
    res.status(204).send();
  } else {
    res
      .status(404)
      .json({ message: `No se encontró un pedido con id ${req.params.id}` });
  }
};
