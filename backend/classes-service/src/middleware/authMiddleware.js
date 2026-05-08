const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token requerido.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'change-this-secret');
    return next();
  } catch (_error) {
    return res.status(403).json({ message: 'Token invalido o expirado.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Solo ADMIN puede modificar clases.' });
  }
  return next();
}

module.exports = { authenticateToken, requireAdmin };
