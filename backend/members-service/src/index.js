const express = require('express');
const cors = require('cors');
require('dotenv').config();

const memberController = require('./controllers/memberController');
const { initializeDatabase } = require('./repositories/memberRepository');
const { authenticateToken, requireAdmin } = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ service: 'members-service', status: 'ok' }));
app.get('/members', authenticateToken, memberController.list);
app.get('/members/:id', authenticateToken, memberController.getById);
app.post('/members', authenticateToken, requireAdmin, memberController.create);
app.put('/members/:id', authenticateToken, requireAdmin, memberController.update);
app.delete('/members/:id', authenticateToken, requireAdmin, memberController.remove);

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Members service running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Members service failed to start', error);
    process.exit(1);
  });
