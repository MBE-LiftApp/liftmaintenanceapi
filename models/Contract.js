module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define(
    'Contract',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      projectLiftId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'project_lift_id',
      },

      amcType: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'amc_type',
      },

      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'start_date',
      },

      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'end_date',
      },

      serviceIntervalDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'service_interval_days',
      },

      serviceVisitCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'service_visit_count',
      },

      billingCycle: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'billing_cycle',
      },

      contractValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'contract_value',
      },

      amcNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'amc_notes',
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'created_at',
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at',
      },
    },
    {
      tableName: 'contracts',
      timestamps: false,
    }
  );

  Contract.associate = (models) => {
    Contract.belongsTo(models.ProjectLift, {
      foreignKey: 'projectLiftId',
    });
  };

  return Contract;
};