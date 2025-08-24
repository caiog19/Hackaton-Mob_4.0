const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const routePlannerRoutes = require('./routes/routePlanner.js'); 
const rioBuses = require('./routes/rioBuses');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/routes', routePlannerRoutes);
app.use('/api/rio', rioBuses);
app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

module.exports = app;
