require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const storage = process.env.DB_STORAGE || path.join(__dirname, '../../data/database.sqlite');
fs.mkdirSync(path.dirname(storage), { recursive: true });

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage,
  logging: false,
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao DB.');
  } catch (err) {
    console.error('❌ Erro ao conectar no DB:', err);
  }
}

module.exports = { sequelize, testConnection };
