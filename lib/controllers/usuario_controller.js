import db from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/config';

const { Usuario } = db;
const JWT_SECRET = config.getJwtSecret();
const JWT_EXPIRES = '24h';

export const getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] },
    });
    res.json({ data: usuarios });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ data: usuario });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const usuario = await Usuario.create({ ...rest, password: hashedPassword });
    const userData = usuario.toJSON();
    delete userData.password;
    res.status(201).json({ data: userData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const updates = { ...req.body };
    // Profesor no puede cambiar su propio rol
    if (req.user.rol === 'Profesor') {
      delete updates.rol;
    }
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    } else {
      delete updates.password;
    }
    await usuario.update(updates);
    const userData = usuario.toJSON();
    delete userData.password;
    res.json({ data: userData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, { paranoid: false });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (usuario.deletedAt) {
      return res
        .status(400)
        .json({ message: 'Este usuario ya está eliminado' });
    }
    const pedidosCount = await db.Pedido.count({
      where: { usuarioId: req.params.id },
    });
    if (pedidosCount > 0) {
      return res
        .status(400)
        .json({
          message: `No se puede eliminar: el usuario tiene ${pedidosCount} pedido(s) asociado(s). Primero eliminá los pedidos.`,
        });
    }
    await usuario.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    const userData = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      token,
    };

    res.json({ data: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
