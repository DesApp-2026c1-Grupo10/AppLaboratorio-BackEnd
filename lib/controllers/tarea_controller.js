import db from '../models';

export const getTareas = async (req, res) => {
  const tareas = await db.Tarea.findAll({
    where: { pedidoId: req.params.id },
    order: [
      ['tipo', 'ASC'],
      ['id', 'ASC'],
    ],
  });
  res.json({ data: tareas.map((t) => t.toJSON()) });
};

export const toggleTarea = async (req, res) => {
  const tarea = await db.Tarea.findOne({
    where: { id: req.params.tareaId, pedidoId: req.params.id },
  });
  if (!tarea) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  await tarea.update({ completada: !tarea.completada });
  res.json({ data: tarea.toJSON() });
};
