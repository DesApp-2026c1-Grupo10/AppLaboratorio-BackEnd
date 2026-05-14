const db = require("../models").default || require("../models");
const { Op } = require("sequelize");

const {
    Pedido,
    Laboratorio,
    Usuario,
} = db;

exports.getAll = async (req, res) => {

    try {

        const pedidos = await Pedido.findAll({
            include: [Laboratorio, Usuario],
        });
        
        res.json(pedidos);
        
    } catch (error) {

        res.status(500).json({
            error: error.message,
        });
    }
};


exports.getById = async (req, res) => {

  try {

    const pedido = await Pedido.findByPk(
      req.params.id,
      {
        include: [Laboratorio, Usuario],
      }
    );

    if (!pedido) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    res.json(pedido);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {

  try {

    const {
      fecha,
      horaInicio,
      horaFin,
      laboratorioId,
    } = req.body;

    // Validar horario lógico
    if (horaInicio >= horaFin) {

      return res.status(400).json({
        error:
          "La hora de inicio debe ser menor a la hora de fin",
      });
    }

    // Buscar superposición
    const conflicto = await Pedido.findOne({

      where: {

        fecha,
        laboratorioId,

        estado: {
          [Op.ne]: "Rechazado",
        },

        [Op.or]: [

          // Nueva reserva empieza dentro de otra
          {
            horaInicio: {
              [Op.lt]: horaFin,
            },

            horaFin: {
              [Op.gt]: horaInicio,
            },
          },
        ],
      },
    });

    if (conflicto) {

      return res.status(409).json({
        error:
          "El laboratorio ya está reservado en ese horario",
      });
    }

    const pedido =
      await Pedido.create(req.body);

    res.status(201).json(pedido);

  } catch (error) {

    res.status(400).json({
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {

  try {

    const pedido = await Pedido.findByPk(
      req.params.id
    );

    if (!pedido) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    await pedido.update(req.body);

    res.json(pedido);

  } catch (error) {

    res.status(400).json({
      error: error.message,
    });
  }
};

exports.remove = async (req, res) => {

  try {

    const pedido = await Pedido.findByPk(
      req.params.id
    );

    if (!pedido) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    await pedido.destroy();

    res.status(204).send();

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });
  }
};



