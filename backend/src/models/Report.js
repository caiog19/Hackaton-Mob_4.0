const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Report = sequelize.define(
    "Report",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      busLine: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      upvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      downvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "reports",
      timestamps: true,
    }
  );

  return Report;
};
