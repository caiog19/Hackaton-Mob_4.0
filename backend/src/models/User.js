const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(120), allowNull: true },
    email: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(200), allowNull: false },
    phone: { type: DataTypes.STRING(30), allowNull: true },
    reputation: { type: DataTypes.INTEGER, defaultValue: 0 },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'users',
    timestamps: true
  });

  return User;
};
