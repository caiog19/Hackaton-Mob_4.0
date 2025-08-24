const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const User = require('./User')(sequelize);
const Report = require('./Report')(sequelize);

User.hasMany(Report, { foreignKey: 'userId', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'userId', as: 'user' });

async function ensureDb() {
  const qi = sequelize.getQueryInterface();

  await sequelize.query('DROP TABLE IF EXISTS users_backup;');
  await sequelize.query('DROP TABLE IF EXISTS reports_backup;');

  const desc = await qi.describeTable('reports').catch(() => ({}));
  if (!desc.photoUrl) {
    await qi.addColumn('reports', 'photoUrl', {
      type: DataTypes.STRING,
      allowNull: true,
    });
    console.log('🧩 reports.photoUrl criado.');
  }
}

async function syncModels() {
  try {
    await ensureDb();
    await sequelize.sync();
    console.log('✅ Modelos sincronizados com o DB.');
  } catch (err) {
    console.error('❌ Erro ao sincronizar modelos:', err);
  }
}

module.exports = { sequelize, syncModels, User, Report };
