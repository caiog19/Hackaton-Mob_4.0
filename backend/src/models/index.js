const { sequelize } = require('../config/db');
const defineUser = require('./User');
const defineReport = require('./Report');

const User = defineUser(sequelize);
const Report = defineReport(sequelize);

User.hasMany(Report, { foreignKey: 'userId', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Report
};
