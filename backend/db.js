require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT,  
  storage: process.env.DB_STORAGE, 
  logging: false,
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao SQLite com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao conectar no SQLite:', err);
  }
}

module.exports = { sequelize, testConnection };
