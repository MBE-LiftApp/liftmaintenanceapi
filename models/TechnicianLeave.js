// models/TechnicianLeave.js
module.exports = (sequelize, DataTypes) => {
  const TechnicianLeave = sequelize.define(
    "TechnicianLeave",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      technician_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      from_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      to_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "CANCELLED"),
        allowNull: false,
        defaultValue: "APPROVED", // keep simple for now
      },

      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "technician_leaves",
      timestamps: true,
      underscored: true,
    }
  );

  TechnicianLeave.associate = (models) => {
    TechnicianLeave.belongsTo(models.Technician, {
      foreignKey: "technician_id",
      as: "technician",
    });
  };

  return TechnicianLeave;
};