module.exports = (sequelize, DataTypes) => {
  const Lift = sequelize.define(
    'Lift',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      liftCode: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'lift_code',
      },

      building: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'building',
      },

      // Keep compatibility with newer code that expects liftPosition
      liftPosition: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'location',
      },

      customerName: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'customer_name',
      },

      status: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'status',
      },

      amcType: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'amc_type',
      },

      amcStartDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'amc_start_date',
      },

      amcEndDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'amc_end_date',
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
      tableName: 'lifts',
      timestamps: false,
    }
  );

  Lift.associate = (models) => {
    Lift.hasMany(models.ProjectLift, {
      foreignKey: 'liftId',
      sourceKey: 'id',
    });

    // Optional compatibility for any old code that still reads Lift.ServiceLogs
    if (models.ServiceLog) {
      Lift.hasMany(models.ServiceLog, {
        foreignKey: 'liftId',
        sourceKey: 'id',
      });
    }
  };

  return Lift;
};