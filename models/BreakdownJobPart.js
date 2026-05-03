module.exports = (sequelize, DataTypes) => {
  const BreakdownJobPart = sequelize.define(
    'BreakdownJobPart',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      qty: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'breakdown_job_parts',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  BreakdownJobPart.associate = (models) => {
    BreakdownJobPart.belongsTo(models.Job, {
      foreignKey: 'job_id',
    });
  };

  return BreakdownJobPart;
};