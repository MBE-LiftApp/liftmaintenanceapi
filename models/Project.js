module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    'Project',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      project_code: { type: DataTypes.TEXT, allowNull: true },
      project_name: { type: DataTypes.TEXT, allowNull: false },
      customer_id: { type: DataTypes.BIGINT, allowNull: false },
      site_id: { type: DataTypes.BIGINT, allowNull: true },
      status: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'OPEN' },
      notes: { type: DataTypes.TEXT, allowNull: true },
      service_zone: { type: DataTypes.STRING(50), allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: 'projects', timestamps: false }
  );

  Project.associate = (models) => {
    Project.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    Project.belongsTo(models.Site, { foreignKey: 'site_id' });
    Project.hasMany(models.ProjectLift, { foreignKey: 'project_id' });
  };

  return Project;
};