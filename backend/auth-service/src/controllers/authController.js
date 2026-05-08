const authService = require('../services/authService');

async function register(req, res) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function me(req, res) {
  try {
    const user = await authService.getProfile(req.user.sub);
    res.json(user);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

module.exports = { register, login, me };
