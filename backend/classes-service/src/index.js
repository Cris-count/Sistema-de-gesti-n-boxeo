const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { corsOptions } = require('./corsConfig');
const classController = require('./controllers/classController');
const { initializeDatabase } = require('./repositories/classRepository');
const { authenticateToken, requireAdmin } = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3003;

app.use(cors(corsOptions()));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ service: 'classes-service', status: 'ok' }));
app.get('/classes', authenticateToken, classController.list);
app.get('/classes/:id', authenticateToken, classController.getById);
app.post('/classes', authenticateToken, requireAdmin, classController.create);
app.put('/classes/:id', authenticateToken, requireAdmin, classController.update);
app.delete('/classes/:id', authenticateToken, requireAdmin, classController.remove);

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Classes service running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Classes service failed to start', error);
    process.exit(1);
  });
