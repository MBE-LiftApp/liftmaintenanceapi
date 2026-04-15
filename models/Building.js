module.exports = (sequelize, DataTypes) => {
  const Building = sequelize.define(
    "Building",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(200), allowNull: false },
      address: { type: DataTypes.STRING(500), allowNull: true },
      contactName: { type: DataTypes.STRING(200), allowNull: true },
      contactPhone: { type: DataTypes.STRING(50), allowNull: true },
    },
    { tableName: "buildings", timestamps: true }
  );

  return Building;
};
