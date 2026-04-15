module.exports = (sequelize, DataTypes) => {
  const TechnicianSession = sequelize.define(
    'TechnicianSession',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      technician_id: { type: DataTypes.BIGINT, allowNull: false },
      token: { type: DataTypes.TEXT, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      last_seen_at: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: 'technician_sessions', timestamps: false }
  );

  TechnicianSession.associate = (models) => {
    TechnicianSession.belongsTo(models.Technician, { foreignKey: 'technician_id' });
  };

  return TechnicianSession;
};
