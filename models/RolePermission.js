module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define(
    'RolePermission',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      roleId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'role_id',
      },
      permissionId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'permission_id',
      },
    },
    {
      tableName: 'role_permissions',
      timestamps: false,
    }
  );

  return RolePermission;
};