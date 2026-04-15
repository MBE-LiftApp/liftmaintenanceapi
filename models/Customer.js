module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    'Customer',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.TEXT, allowNull: false },
      phone: { type: DataTypes.TEXT, allowNull: true },
      email: { type: DataTypes.TEXT, allowNull: true },
      address: { type: DataTypes.TEXT, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'customers',
      timestamps: false,
    }
  );

  Customer.associate = (models) => {
    Customer.hasMany(models.Lift, { foreignKey: 'customerId' });
  };

  return Customer;
};
