module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define(
    'Contract',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      // ✅ FIXED: use project_lift_id instead of lift_id
      projectLiftId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'project_lift_id',
      },

      contractType: { type: DataTypes.TEXT, allowNull: false, field: 'contract_type' },

      startDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'start_date' },
      endDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'end_date' },

      status: { type: DataTypes.TEXT, allowNull: false, field: 'status' },
      remarks: { type: DataTypes.TEXT, allowNull: true, field: 'remarks' },

      amcType: { type: DataTypes.TEXT, allowNull: true, field: 'amc_type' },
      billingCycle: { type: DataTypes.TEXT, allowNull: true, field: 'billing_cycle' },
      contractValue: { type: DataTypes.DECIMAL(12, 2), allowNull: true, field: 'contract_value' },
      serviceIntervalDays: { type: DataTypes.INTEGER, allowNull: true, field: 'service_interval_days' },
      amcNotes: { type: DataTypes.TEXT, allowNull: true, field: 'amc_notes' },
    },
    {
      tableName: 'contracts',
      timestamps: false,
    }
  );

  Contract.associate = (models) => {
    // ✅ FIXED association
    Contract.belongsTo(models.ProjectLift, {
      foreignKey: 'projectLiftId',
    });
  };

  return Contract;
};