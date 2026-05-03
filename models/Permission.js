module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    'Permission',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING, allowNull: false, unique: true },
      label: { type: DataTypes.STRING, allowNull: false },
      module: { type: DataTypes.STRING, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'permissions',
      timestamps: false,
    }
  );

  Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
      through: models.RolePermission,
      foreignKey: 'permission_id',
      otherKey: 'role_id',
      as: 'roles',
    });
  };

  return Permission;
};