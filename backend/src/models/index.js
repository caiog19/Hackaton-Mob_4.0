
const { sequelize } = require('../config/db');

const User = require('./User')(sequelize);
const Report = require('./Report')(sequelize); 

User.hasMany(Report, { foreignKey: 'userId', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'userId', as: 'user' });


async function syncModels() {
  try {
    await sequelize.sync({ alter: true }); 
    console.log('✅ Modelos sincronizados com o DB.');
  } catch (err) {
    console.error('❌ Erro ao sincronizar modelos:', err);
  }
}

module.exports = {
  sequelize,
  syncModels,
  User,
  Report,
};