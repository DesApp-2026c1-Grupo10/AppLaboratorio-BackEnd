import jwt from 'jsonwebtoken';
import config from '../lib/config/config';

export function getToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    config.getJwtSecret(),
    { expiresIn: '1h' }
  );
}

export function authHeader(user) {
  return { Authorization: `Bearer ${getToken(user)}` };
}
