const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { publicUser } = require('../dto/authDto');

const jwtSecret = process.env.JWT_SECRET || 'change-this-secret';

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    jwtSecret,
    { expiresIn: '8h' }
  );
}

async function register({ name, email, password, role }) {
  if (!name || !email || !password) {
    const error = new Error('Nombre, email y password son obligatorios.');
    error.status = 400;
    throw error;
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const error = new Error('El email ya esta registrado.');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.createUser({
    name,
    email,
    passwordHash,
    role: role === 'ADMIN' ? 'ADMIN' : 'USER'
  });

  return { user: publicUser(user), token: signToken(user) };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email || '');
  if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
    const error = new Error('Credenciales invalidas.');
    error.status = 401;
    throw error;
  }

  return { user: publicUser(user), token: signToken(user) };
}

async function getProfile(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    const error = new Error('Usuario no encontrado.');
    error.status = 404;
    throw error;
  }
  return publicUser(user);
}

module.exports = { register, login, getProfile };
