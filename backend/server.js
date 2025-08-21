// server.js
require('dotenv').config();
const express = require('express');
const { sequelize, testConnection } = require('./db');

const app = express();
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await sequelize.query('SELECT 1+1 AS result');
    res.json({ ok: true, db: 'sqlite up' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

(async () => {
  await testConnection();
  app.listen(PORT, () =>
    console.log(`🚀 API rodando em http://localhost:${PORT}`)
  );
})();
