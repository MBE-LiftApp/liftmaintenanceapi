module.exports = (sequelize, DataTypes) => {
  const Technician = sequelize.define(
    'Technician',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.TEXT, allowNull: false },
      phone: { type: DataTypes.TEXT, allowNull: true },
      email: { type: DataTypes.TEXT, allowNull: true },
      role: { type: DataTypes.TEXT, allowNull: true },
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

  return Technician;
};