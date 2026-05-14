const db =
  require("../models").default ||
  require("../models");

const {
  Laboratorio,
  Pedido,
} = db;

exports.getAll = async (req, res) => {

  try {

    const laboratorios =
      await Laboratorio.findAll();

    res.json(laboratorios);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {

  try {

    const laboratorio =
      await Laboratorio.findByPk(
        req.params.id
      );

    if (!laboratorio) {
      return res.status(404).json({
        error: "Laboratorio no encontrado",
      });
    }

    res.json(laboratorio);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {

  try {

    const laboratorio =
      await Laboratorio.create(req.body);

    res.status(201).json(laboratorio);

  } catch (error) {

    res.status(400).json({
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {

  try {

    const laboratorio =
      await Laboratorio.findByPk(
        req.params.id
      );

    if (!laboratorio) {
      return res.status(404).json({
        error: "Laboratorio no encontrado",
      });
    }

    await laboratorio.update(req.body);

    res.json(laboratorio);

  } catch (error) {

    res.status(400).json({
      error: error.message,
    });
  }
};

exports.remove = async (req, res) => {

  try {

    const laboratorio =
      await Laboratorio.findByPk(
        req.params.id
      );

    if (!laboratorio) {
      return res.status(404).json({
        error: "Laboratorio no encontrado",
      });
    }

    await laboratorio.destroy();

    res.status(204).send();

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });
  }
};

exports.disponibilidad = async (req, res) => {

  try {

    const laboratorioId = req.params.id;

    const { fecha } = req.query;

    const laboratorio =
      await Laboratorio.findByPk(
        laboratorioId
      );

    if (!laboratorio) {

      return res.status(404).json({
        error:
          "Laboratorio no encontrado",
      });
    }

    const reservas =
      await Pedido.findAll({

        where: {
          laboratorioId,
          fecha,
        },

        order: [
          ["horaInicio", "ASC"],
        ],
      });

    res.json({
      laboratorioId,
      fecha,
      reservas,
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });
  }
};





















