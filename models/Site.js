module.exports = (sequelize, DataTypes) => {
  const Site = sequelize.define(
    'Site',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.TEXT, allowNull: false },
      address: { type: DataTypes.TEXT, allowNull: true },
      gpsLat: { type: DataTypes.DECIMAL(10, 7), allowNull: true, field: 'gps_lat' },
      gpsLng: { type: DataTypes.DECIMAL(10, 7), allowNull: true, field: 'gps_lng' },
      contactPerson: { type: DataTypes.TEXT, allowNull: true, field: 'contact_person' },
      contactPhone: { type: DataTypes.TEXT, allowNull: true, field: 'contact_phone' },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'sites',
      timestamps: false,
    }
  );

  Site.associate = (models) => {
    Site.hasMany(models.Lift, { foreignKey: 'siteId' });
  };

  return Site;
};
