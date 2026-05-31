import { Op } from 'sequelize';
import db from '../models';
const { Laboratorio, Pedido } = db;

export const getAll = async (req, res) => {
  try {
    const laboratorios = await Laboratorio.findAll();
    // Envolvemos en data para que el frontend no explote al hacer .map()
    res.json({ data: laboratorios.map((lab) => lab.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const laboratorio = await Laboratorio.findByPk(req.params.id);
    if (!laboratorio) {
      return res.status(404).json({ message: 'Laboratorio no encontrado' });
    }
    res.json({ data: laboratorio.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const laboratorio = await Laboratorio.create(req.body);
    res.status(201).json({ data: laboratorio.toJSON() });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const laboratorio = await Laboratorio.findByPk(req.params.id);
    if (!laboratorio) {
      return res.status(404).json({ message: 'Laboratorio no encontrado' });
    }
    await laboratorio.update(req.body);
    res.json({ data: laboratorio.toJSON() });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const laboratorio = await Laboratorio.findByPk(req.params.id);
    if (!laboratorio) {
      return res.status(404).json({ message: 'Laboratorio no encontrado' });
    }
    await laboratorio.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const disponibilidad = async (req, res) => {
  try {
    const laboratorioId = req.params.id;
    const { fecha } = req.query;
    const laboratorio = await Laboratorio.findByPk(laboratorioId);

    if (!laboratorio) {
      return res.status(404).json({ message: 'Laboratorio no encontrado' });
    }

    const reservas = await Pedido.findAll({
      where: { laboratorioId, fecha, estado: { [Op.ne]: 'Rechazado' } },
      order: [['horaInicio', 'ASC']],
    });

    res.json({
      data: {
        laboratorioId,
        fecha,
        reservas,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
