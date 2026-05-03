module.exports = (sequelize, DataTypes) => {
  const Technician = sequelize.define(
    'Technician',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.TEXT, allowNull: false },
      phone: { type: DataTypes.TEXT, allowNull: true },
      email: { type: DataTypes.TEXT, allowNull: true },

      // Keep old role for backward compatibility during migration
      role: { type: DataTypes.TEXT, allowNull: true },

      // New RBAC role link
      roleId: {
        type: DataTypes.BIGINT,
        allowNull: true, // make true first, then false after backfill
        field: 'role_id',
      },

availability_status: {
  type: DataTypes.ENUM("AVAILABLE", "OFF_DUTY", "ON_LEAVE", "SUSPENDED"),
  allowNull: false,
  defaultValue: "AVAILABLE",
},
      skills: { type: DataTypes.TEXT, allowNull: true },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },

      pinHash: { type: DataTypes.TEXT, allowNull: true, field: 'pin_hash' },
      pinSalt: { type: DataTypes.TEXT, allowNull: true, field: 'pin_salt' },

      mustChangePin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'must_change_pin',
      },
    },
    {
      tableName: 'technicians',
      timestamps: false,
    }
  );

  Technician.associate = (models) => {
    Technician.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'roleRef',
    });

    Technician.hasMany(models.TechnicianSession, {
      foreignKey: 'technician_id',
      as: 'sessions',
    });
  };

  return Technician;
};