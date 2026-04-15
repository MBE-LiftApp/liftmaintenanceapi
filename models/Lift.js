module.exports = (sequelize, DataTypes) => {
  const Lift = sequelize.define(
    'Lift',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      // UI: liftCode -> DB: job_no
      liftCode: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        field: 'job_no',
      },

      customerId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'customer_id',
      },

      siteId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'site_id',
      },

      // New clear name for where the lift sits inside the project
      liftPosition: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'lift_position',
      },

      // Optional existing label in DB
      liftLabel: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'lift_label',
      },

      status: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'ACTIVE',
        field: 'current_status',
      },

      brand: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'brand',
      },

      model: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'model',
      },

      capacityKg: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'capacity_kg',
      },

      stops: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'stops',
      },

      commissioningDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'commissioning_date',
      },

      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'notes',
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
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  Lift.associate = (models) => {
    Lift.belongsTo(models.Customer, { foreignKey: 'customerId' });
    Lift.belongsTo(models.Site, { foreignKey: 'siteId' });

    Lift.hasMany(models.Contract, { foreignKey: 'liftId', onDelete: 'CASCADE' });
    Lift.hasMany(models.ServiceLog, { foreignKey: 'liftId', onDelete: 'CASCADE' });
    Lift.hasMany(models.ProjectLift, { foreignKey: 'liftId', sourceKey: 'id' });
  };

  return Lift;
};