module.exports = (sequelize, DataTypes) => {
  const ServiceLog = sequelize.define(
    'ServiceLog',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      liftId: { type: DataTypes.BIGINT, allowNull: false, field: 'lift_id' },
      serviceDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'service_date' },

      technician: { type: DataTypes.STRING, allowNull: false, field: 'technician_name' },
      workDone: { type: DataTypes.TEXT, allowNull: true, field: 'work_done' },
      remarks: { type: DataTypes.TEXT, allowNull: true, field: 'remarks' },

      // Optional (dashboard uses cost totals)
      cost: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'cost' },

      // Optional (future use)
      nextServiceDue: { type: DataTypes.DATEONLY, allowNull: true, field: 'next_service_due' },
    },
    {
      tableName: 'service_logs',
      timestamps: true,
      underscored: true,
    }
  );

  ServiceLog.associate = (models) => {
    ServiceLog.belongsTo(models.Lift, { foreignKey: 'liftId' });
  };

  return ServiceLog;
};
