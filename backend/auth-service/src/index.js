const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { corsOptions } = require('./corsConfig');
const authController = require('./controllers/authController');
const { initializeDatabase } = require('./repositories/userRepository');
const { authenticateToken } = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors(corsOptions()));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ service: 'auth-service', status: 'ok' }));
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.get('/auth/me', authenticateToken, authController.me);

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Auth service running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Auth service failed to start', error);
    process.exit(1);
  });
