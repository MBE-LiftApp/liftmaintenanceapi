module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },

      passwordHash: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'password_hash',
      },

      role: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
      },

permissions: {
  type: DataTypes.JSONB,
  allowNull: false,
  defaultValue: {},
},
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },

      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      tableName: 'users',
    }
  );

  return User;
};