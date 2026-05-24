const db = require('../models').default || require('../models');
const { Usuario } = db;

exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json({ data: usuarios }); // Lo envuelvo en data para que sea igual a pedidos
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ data: usuario });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body);
    res.status(201).json({ data: usuario });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    await usuario.update(req.body);
    res.json({ data: usuario });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    await usuario.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NUEVA FUNCIÓN DE LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar si existe el email
    const usuario = await Usuario.findOne({ where: { email: email } });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 2. Verificar la contraseña
    if (usuario.password !== password) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Si todo está bien, devolvemos los datos del usuario (sin la contraseña por seguridad)
    const userData = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
    };

    res.json({ data: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
