const db =
  require("../models").default ||
  require("../models");

const { Usuario } = db;

exports.getAll = async (req, res) => {

  try {

    const usuarios =
      await Usuario.findAll();

    res.json(usuarios);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {

  try {

    const usuario =
      await Usuario.findByPk(
        req.params.id
      );

    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    res.json(usuario);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {

  try {

    const usuario =
      await Usuario.create(req.body);

    res.status(201).json(usuario);

  } catch (error) {

    res.status(400).json({
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {

  try {

    const usuario =
      await Usuario.findByPk(
        req.params.id
      );

    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    await usuario.update(req.body);

    res.json(usuario);

  } catch (error) {

    res.status(400).json({
      error: error.message,
    });
  }
};

exports.remove = async (req, res) => {

  try {

    const usuario =
      await Usuario.findByPk(
        req.params.id
      );

    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    await usuario.destroy();

    res.status(204).send();

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });
  }
};