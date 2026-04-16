module.exports = (sequelize, DataTypes) => {
  const Site = sequelize.define(
    'Site',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.TEXT, allowNull: false },
      address: { type: DataTypes.TEXT, allowNull: true },
      gpsLat: { type: DataTypes.DECIMAL(10, 7), allowNull: true, field: 'gps_lat' },
      gpsLng: { type: DataTypes.DECIMAL(10, 7), allowNull: true, field: 'gps_lng' },
      createdAt: { type: DataTypes.DATE, allowNull: true, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, allowNull: true, field: 'updated_at' },
    },
    {
      tableName: 'sites',
      timestamps: false,
    }
  );

  Site.associate = (models) => {
    Site.hasMany(models.Project, { foreignKey: 'site_id' });
  };

Customer.associate = (models) => {
  Customer.hasMany(models.Project, { foreignKey: 'customer_id' });
};

  return Site;
};