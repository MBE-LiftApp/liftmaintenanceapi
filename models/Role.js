module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    'Role',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      isSystemRole: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_system_role',
      },
    },
    {
      tableName: 'roles',
      timestamps: false,
    }
  );

  Role.associate = (models) => {
    Role.belongsToMany(models.Permission, {
      through: models.RolePermission,
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions',
    });

    Role.hasMany(models.Technician, {
      foreignKey: 'role_id',
      as: 'technicians',
    });
  };

  return Role;
};