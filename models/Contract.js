module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define(
    'Contract',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      liftId: { type: DataTypes.BIGINT, allowNull: false, field: 'lift_id' },
      contractType: { type: DataTypes.TEXT, allowNull: false, field: 'contract_type' },
      // Made nullable by DB_COMPAT_MIGRATION.sql so UI can save AMC type first, dates later.
      startDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'start_date' },
      endDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'end_date' },
      status: { type: DataTypes.TEXT, allowNull: false, field: 'status' },
      remarks: { type: DataTypes.TEXT, allowNull: true, field: 'remarks' },

      // Added by DB_COMPAT_MIGRATION.sql to support current UI
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
    Contract.belongsTo(models.Lift, { foreignKey: 'liftId' });
  };

  return Contract;
};
