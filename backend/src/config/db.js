require('dotenv').config();
const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false 
      }
    },
    logging: false,
  });
} else {
  const path = require('path');
  const storage = process.env.DB_STORAGE || path.join(__dirname, '../../db.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
  });
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao DB.');
  } catch (err) {
    console.error('❌ Erro ao conectar no DB:', err);
  }
}

module.exports = { sequelize, testConnection };