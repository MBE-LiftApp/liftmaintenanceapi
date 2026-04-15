module.exports = (sequelize, DataTypes) => {
  const Lift = sequelize.define(
    'Lift',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      // Map UI "liftCode" to the real DB column "job_no"
      liftCode: { type: DataTypes.TEXT, allowNull: false, unique: true, field: 'lift_code' },

customerId: { type: DataTypes.BIGINT, allowNull: false, field: 'customer_id' },
siteId: { type: DataTypes.BIGINT, allowNull: true, field: 'site_id' },

location: { type: DataTypes.TEXT, allowNull: true, field: 'location' },

status: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'ACTIVE', field: 'status' },

      brand: { type: DataTypes.TEXT, allowNull: true, field: 'brand' },
      model: { type: DataTypes.TEXT, allowNull: true, field: 'model' },
      capacityKg: { type: DataTypes.INTEGER, allowNull: true, field: 'capacity_kg' },
      stops: { type: DataTypes.INTEGER, allowNull: true, field: 'stops' },
      commissioningDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'commissioning_date' },
      notes: { type: DataTypes.TEXT, allowNull: true, field: 'notes' },
    },
    {
      tableName: 'lifts',
      timestamps: false,
    }
  );

  Lift.associate = (models) => {
    Lift.belongsTo(models.Customer, { foreignKey: 'customerId' });
    Lift.belongsTo(models.Site, { foreignKey: 'siteId' });

    // AMC contract record
    Lift.hasMany(models.Contract, { foreignKey: 'liftId', onDelete: 'CASCADE' });

    // Compatibility: UI uses Service Logs
    Lift.hasMany(models.ServiceLog, { foreignKey: 'liftId', onDelete: 'CASCADE' });

// ADD THIS
    Lift.hasMany(models.ProjectLift, { foreignKey: 'liftId', sourceKey: 'id' });
  };
    
  return Lift;
};
