import db from '../models';

const { ActividadPredefinida, Laboratorio, Usuario } = db;

const include = [
  { model: Laboratorio },
  { model: Usuario, attributes: ['id', 'nombre', 'apellido'], paranoid: false },
];

export const getAll = async (req, res) => {
  const actividades = await ActividadPredefinida.findAll({
    include,
    order: [['nombre', 'ASC']],
  });
  res.json({ data: actividades });
};

export const getById = async (req, res) => {
  const actividad = await ActividadPredefinida.findByPk(req.params.id, {
    include,
  });
  if (!actividad)
    return res.status(404).json({ message: 'Actividad no encontrada' });
  res.json({ data: actividad });
};

export const create = async (req, res) => {
  const {
    nombre,
    laboratorioId,
    horaInicio,
    horaFin,
    cantidadAlumnos,
    descripcion,
    config,
    usuarioId,
  } = req.body;
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }
  const actividad = await ActividadPredefinida.create({
    nombre,
    laboratorioId,
    horaInicio,
    horaFin,
    cantidadAlumnos,
    descripcion,
    config: config || null,
    usuarioId,
  });
  const created = await ActividadPredefinida.findByPk(actividad.id, {
    include,
  });
  res.status(201).json({ data: created });
};

export const update = async (req, res) => {
  const actividad = await ActividadPredefinida.findByPk(req.params.id);
  if (!actividad)
    return res.status(404).json({ message: 'Actividad no encontrada' });
  await actividad.update(req.body);
  const updated = await ActividadPredefinida.findByPk(actividad.id, {
    include,
  });
  res.json({ data: updated });
};

export const remove = async (req, res) => {
  const actividad = await ActividadPredefinida.findByPk(req.params.id);
  if (!actividad)
    return res.status(404).json({ message: 'Actividad no encontrada' });
  await actividad.destroy();
  res.status(204).send();
};
