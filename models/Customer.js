module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    'Customer',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.TEXT, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: true, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, allowNull: true, field: 'updated_at' },
    },
    {
      tableName: 'customers',
      timestamps: false,
    }
  );

  Customer.associate = (models) => {
    Customer.hasMany(models.Project, { foreignKey: 'customer_id' });
  };

  return Customer;
};